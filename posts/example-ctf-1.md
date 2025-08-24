# Example CTF — Pwn challenge (Intro)


**Category:** pwn
**Points:** 100
**Author:** example


## Summary


This challenge gives you a small binary with a buffer overflow that allows return-oriented programming.


## Steps


1. Run the binary and inspect it with `file` / `strings` / `checksec`.
2. Find that stack canaries are disabled and NX is enabled.
3. Leak an address via format string or other primitive.
4. Build ROP chain to spawn a shell.


## Exploit (example)


```bash
# local exploit snippet
python3 exploit.py
