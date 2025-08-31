# Solution

we are given this encrypted flag:

    灩捯䍔䙻ㄶ形楴獟楮獴㌴摟潦弸弰摤捤㤷慽
    
and this piece of code:

    ''.join([chr((ord(flag[i]) << 8) + ord(flag[i + 1])) for i in range(0, len(flag), 2)])
     
indented:
     
        ''.join(
        [
            chr(
                (
                    ord(flag[i]) << 8) +
                    ord(flag[i + 1]
                )
            )
            for i in range(
                0,
                len(flag),
                2
            )
        ]
    )

so what this code does is its taken the flag as input (the flag that we want)

and it has encrypted the flag returning this string: 灩捯䍔䙻ㄶ形楴獟楮獴㌴摟潦弸弰摤捤㤷

what we have to figure out is how the code does this and reverse engineer it

and creating our own code that decrypts the string

What the code does exactly:

1. Takes the first element (ascii symbol) in the flag and turns it into its unicode value with *ord* function (all symbols have a certain unicode value)
2. the **<<** operator shifts the Unicode number of the first element in the flag 8 bits to the right, meaning the binary number equvalent gets 8 zeroes added from the right, example:

if we have the **~** symbol, its unicode value is **126**, which translates to **0111 1110** in binary

shifting the unicode value for **~** one step to the left makes the unicode value double, which is logical, since the new binary value is **1111 1100**

![Screenshot 2021-11-24 at 21 17 10](https://user-images.githubusercontent.com/74051842/143307942-123edd2e-658c-4944-ac25-090286637618.png)

3. The second element in the flag has its unicode added to the newly created unicode from the first element
4. then the **chr** function is applied to the newly created unicode made from 2 characters in the flag
5. then the function does the same for each pair of elements in the list, using for loops with steps of 2
6. The characters are joined together, which then returns us those japanese/chinese (I wouldnt know! 😫) symbols which represent the unicodes of which the function calculated

This code reverses the process:

        flag = '灩捯䍔䙻ㄶ形楴獟楮獴㌴摟潦弸弰摤捤㤷慽'
        out = ""
        for l in flag:
            l = ord(l) 
            out += chr((l)>>8 & 0xFF00) 
            out += chr((l & 0x00FF)) 
        print(out)

since each character here are made out of 2 characters from the flag the binary value for each character will have 16 bits whereas the ascii symbols in the flag will contain just 8 bits, this is a result of the shifting 

for each character we will have to reverse the bit-shifting by shifting to the right this time, and then ignoring the 8 last bits by filtering them out with the help of the & function and 0x00FF, adding the result to the output.

then the second half of the character will also get added to the output but left as it is, since it wasnt modified from the beginning

and we get the flag by printing!

# Takeaways

- characters have unicode
- **>>** does bitshifting
- & function combined with 0xFF00 can be used to filter out bit values
