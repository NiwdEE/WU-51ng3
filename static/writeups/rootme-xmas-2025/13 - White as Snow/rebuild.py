import os

INPUT_FILE = "white_as_snow/ho_ho_snooow.tiff"
OUTPUT_FILE = "rebuilt.jpg"

SOI = b"\xff\xd8"
EOI = b"\xff\xd9"

MARKERS_OF_INTEREST = (
    b"\xff\xdb",  # DQT
    b"\xff\xc4",  # DHT
    b"\xff\xc0",  # SOF0
    b"\xff\xc2",  # SOF2
    b"\xff\xda",  # SOS
)

def iter_chunks(fp):
    """Yield JPEG-like chunks starting with FFD8"""
    buf = b""
    while True:
        chunk = fp.read(1024 * 1024)
        if not chunk:
            break
        buf += chunk

        while True:
            start = buf.find(SOI)
            if start == -1:
                buf = buf[-2:]
                break

            next_start = buf.find(SOI, start + 2)
            if next_start == -1:
                buf = buf[start:]
                break

            yield buf[start:next_start]
            buf = buf[next_start:]

    if buf.startswith(SOI):
        yield buf


def is_real_header(chunk):
    return any(m in chunk[:512] for m in MARKERS_OF_INTEREST)


def extract_payload(chunk):
    # Skip fake FFD8 FFEE header if present
    if chunk.startswith(b"\xff\xd8\xff\xee"):
        return chunk[4:]
    return chunk


def main():
    headers = []
    entropy_streams = []

    with open(INPUT_FILE, "rb") as f:
        for i, chunk in enumerate(iter_chunks(f)):
            if is_real_header(chunk):
                headers.append(chunk)
            else:
                entropy_streams.append(extract_payload(chunk))

    if not headers:
        raise RuntimeError("No JPEG headers found")

    with open(OUTPUT_FILE, "wb") as out:
        out.write(SOI)

        # Write unique headers only once
        seen = set()
        for h in headers:
            for m in MARKERS_OF_INTEREST:
                idx = h.find(m)
                if idx != -1 and m not in seen:
                    seen.add(m)
                    out.write(h[idx:])

        # Write entropy-coded data
        for payload in entropy_streams:
            out.write(payload)

        out.write(EOI)

    print(f"[+] Rebuilt JPEG written to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
