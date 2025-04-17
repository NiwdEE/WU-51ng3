# Summary

## Pwn
- [dejavu](#dejavu)

## Reverse
- [Droid](#droid)
- [Echoes in Stone](#echoes)
- [The Mechanical Bird's Nest](#bird)

## IA

- [Mirror Witch](#mirror)

# dejavu

The challenge give us a small program : 

``` c 
void win(void)

{
  undefined8 local_78;
  undefined8 local_70;
  undefined8 local_68;
  undefined8 local_60;
  undefined8 local_58;
  undefined8 local_50;
  undefined8 local_48;
  undefined8 local_40;
  undefined8 local_38;
  undefined8 local_30;
  undefined8 local_28;
  undefined8 local_20;
  undefined4 local_18;
  FILE *local_10;
  
  local_78 = 0;
  local_70 = 0;
  local_68 = 0;
  local_60 = 0;
  local_58 = 0;
  local_50 = 0;
  local_48 = 0;
  local_40 = 0;
  local_38 = 0;
  local_30 = 0;
  local_28 = 0;
  local_20 = 0;
  local_18 = 0;
  puts("You got it!!");
  local_10 = (FILE *)FUN_00401100("flag.txt",&DAT_00402015);
  if (local_10 == (FILE *)0x0) {
    puts("Error: Could not open flag.txt (create this file for testing)");
  }
  else {
    fgets((char *)&local_78,100,local_10);
    printf("%s",&local_78);
    fclose(local_10);
  }

This is the main
undefined8 main(void)

{
  char local_48 [64];
  
  setbuf(stdout,(char *)0x0);
  setbuf(stdin,(char *)0x0);
  printf("pwnme: ");
  gets(local_48);
  return 0;
}
}
```

Quickly, we can see that me need to overflow the function to get the flag (gets() is a really bad function, here there is no verification of the input from the user).
I used gdb to help me and quickly I wrote a little payload to do that.
By doing so i ended up with the flag : squ1rrel{w3v3_b33n_h3r3_b3f0r3_n0w_0nt0_b1gger_4nd_better}.

# droid

In that challenge we get an apk file; I used cutter to learn more about the file and found that function in the application : 

``` java
public final class MainActivityKt {
   private static final int[] expected = new int[]{110, 150, 207, 72, 80, 147, 236, 122, 155, 186, 15, 250, 149, 240, 243, 207, 21, 59, 90, 3, 173, 237, 86, 27, 70, 28, 30, 188, 23, 153, 88};
   private static final int[] key = new int[]{29, 231, 186, 121, 34, 225, 137, 22, 224, 209, 63, 142, 249, 193, 157, 144, 124, 72, 5, 96, 157, 221, 103, 68, 40, 45, 109, 136, 123, 173, 37};

                :
                :

   public static final boolean check(String var0) {
      Intrinsics.checkNotNullParameter(var0, "text");
      if (var0.length() != expected.length) {
         return false;
      } else {
         int[] var3 = new int[expected.length];
         int var1 = 0;

         for(int var2 = expected.length; var1 < var2; ++var1) {
            var3[var1] = var0.charAt(var1) ^ key[var1];
         }

         var0 = ArraysKt.joinToString$default(var3, (CharSequence)null, (CharSequence)null, (CharSequence)null, 0, (CharSequence)null, (Function1)null, 63, (Object)null);
         System.out.println(var0);
         var0 = ArraysKt.joinToString$default(expected, (CharSequence)null, (CharSequence)null, (CharSequence)null, 0, (CharSequence)null, (Function1)null, 63, (Object)null);
         System.out.println(var0);
         return Arrays.equals(var3, expected);
      }
   }

   public static final int[] getExpected() {
      return expected;
   }

   public static final int[] getKey() {
      return key;
   }
}
```
This is a function that verifies a word, probably the password. We will try to reverse it to get the password then.
To get the flag I need for each position i from 0 to 30 : compute the character as flag[i] = (char)(expected[i] ^ key[i]), then i convert it to ascii and add it to my list of characters.
I did the code in Python and got that : 

``` python
# Array containing the expected values (encrypted or encoded data) that the flag should decrypt to
expected = [110, 150, 207, 72, 80, 147, 236, 122, 155, 186, 15, 250, 149, 240, 243, 207, 21, 59, 90, 3, 173, 237, 86, 27, 70, 28, 30, 188, 23, 153, 88]

# Array containing the key values used to encrypt or decrypt the flag
key = [29, 231, 186, 121, 34, 225, 137, 22, 224, 209, 63, 142, 249, 193, 157, 144, 124, 72, 5, 96, 157, 221, 103, 68, 40, 45, 109, 136, 123, 173, 37]

flag = ""  # Initialize an empty string to store the decrypted flag

# Iterate over the indices of the expected and key arrays to decrypt each character
for i in range(len(expected)):
    # XOR the corresponding values from expected and key to get the original character code
    char_code = expected[i] ^ key[i]
    # Convert the character code to its ASCII character and append it to the flag
    flag += chr(char_code)

# Print the final decrypted flag
print("Flag:", flag)

```

Once I executed that code I got the flag : sq1rrel{k0tl1n_is_c001_n1s4l4}.

