import hashlib

FILENAME = "white_as_snow/ho_ho_snooow.tiff"

JPEG_SOI = b"\xff\xd8"
JPEG_EOI = b"\xff\xd9"
JPEG_SIGN_E0 = b"\xff\xd8\xff\xe0"
JPEG_SIGN_EE = b"\xff\xd8\xff\xee"
CHUNK = 1024 * 1024  # 1 MB

jpeg_count = 0
jpeg_ffe0_count = 0
jpeg_ffee_count = 0
jpeg_ffe0_count_u = 0
jpeg_ffee_count_u = 0
jpeg_other_count_u = 0
sizes = []
hashes = {}
bw = []

with open(FILENAME, "rb") as f:
    buf = b""
    offset = 0

    while True:
        chunk = f.read(CHUNK)
        if not chunk:
            break

        buf += chunk

        while True:
            s = buf.find(JPEG_SOI)
            if s == -1:
                break

            if s > 0:
                between = buf[0:s]
                bw.append(between)

            e = buf.find(JPEG_EOI, s + 2)
            if e == -1:
                break

            e+=2
            export = False

            jpeg = buf[s:e]
            h = hashlib.sha256(jpeg).hexdigest()
            if jpeg[0:4] == JPEG_SIGN_E0:
                jpeg_ffe0_count += 1
                if not h in hashes:
                    jpeg_ffe0_count_u += 1
            elif jpeg[0:4] == JPEG_SIGN_EE:
                jpeg_ffee_count += 1
                if not h in hashes:
                    jpeg_ffee_count_u += 1
            else:
                export = True
                if not h in hashes:
                    jpeg_other_count_u += 1

            size = len(jpeg)

            if export and h not in hashes:
                with open(f"extracted/{jpeg_count}.jpg", 'w+b') as out:
                    out.write(jpeg)

            sizes.append(size)
            hashes.setdefault(h, 0)
            hashes[h] += 1
            jpeg_count += 1

            buf = buf[e:]

        # keep overlap for markers crossing chunks
        if len(buf) > 2:
            buf = buf[-2:]


sizes.sort()
size_c = len(sizes)

print("[*] Sizes data:")
print(f"\t[+] Avg size : {sum(sizes)//size_c} bytes")
print(f"\t[+] Min size : {min(sizes)} bytes")
print(f"\t[+] Q1  size : {sizes[size_c//4]} bytes")
print(f"\t[+] Med size : {sizes[size_c//2]} bytes")
print(f"\t[+] Q3  size : {sizes[(size_c*3)//4]} bytes")
print(f"\t[+] Max size : {max(sizes)} bytes")

reused = sum(1 for v in hashes.values() if v > 1)

jpeg_ffe0_count_percent = (10000*jpeg_ffe0_count//jpeg_count)/100
jpeg_ffee_count_percent = (10000*jpeg_ffee_count//jpeg_count)/100
jpeg_other_count = jpeg_count - jpeg_ffe0_count - jpeg_ffee_count
jpeg_other_count_percent = (10000*jpeg_other_count//jpeg_count)/100

print("[*] JPEG streams")
print(f"\t[+] Total JPEG streams : {jpeg_count} ({len(hashes)} unique)")
print(f"\t[+] Reused JPEG streams : {reused}")
print(f"\t[+] Total JPEG with sign FF D8 FF E0 : {jpeg_ffe0_count} ({jpeg_ffe0_count_percent}%) ({jpeg_ffe0_count_u} unique)")
print(f"\t[+] Total JPEG with sign FF D8 FF EE : {jpeg_ffee_count} ({jpeg_ffee_count_percent}%) ({jpeg_ffee_count_u} unique)")
print(f"\t[+] Total JPEG with other sign FF D8 : {jpeg_other_count} ({jpeg_other_count_percent}%) ({jpeg_other_count_u} unique)")
print(f"\t[+] Data between JPEG streams: {len(bw)} times")
if len(bw) > 0:
    bw_avg_size = sum([len(v) for v in bw]) // len(bw)
    print(f"\t[+] Interstreams data AVG: {bw_avg_size} bytes")
