from genericpath import isfile
import os
import sys
import wget
import pathlib
import time

def logo():
    os.system("cls || clear")
    print("""

                                              ██╗  ██╗██╗  ██╗██╗  ██╗
                                              ╚██╗██╔╝██║  ██║██║ ██╔╝
                                               ╚███╔╝ ███████║█████╔╝ 
                                               ██╔██╗ ╚════██║██╔═██╗ 
                                              ██╔╝ ██╗     ██║██║  ██╗
                                              ╚═╝  ╚═╝     ╚═╝╚═╝  ╚═╝
                                   This is tools for convert java script to exe
\n""")

def convert(file):
    pathnode = "C:/Program Files/nodejs/node.exe"
    if (os.path.isfile(pathnode)):
        print("[!] Installing Module...")
        time.sleep(1)
        os.system("cls || clear")
        os.system("npm i pkg -g")
        time.sleep(1)
        os.system("cls || clear")
        print("[!] Convert To Exe....")
        os.system(f"pkg {file}")
        time.sleep(1)
        os.system("cls || clear")
        logo()
    
    else:
        print("[!] Please Install NodeJs. Downloading... [!]")
        time.sleep(1)
        down = wget.download("https://nodejs.org/dist/v14.17.6/node-v14.17.6-x64.msi")
        print(down)
        os.system("cls || clear")
        os.system("node-v14.17.6-x64.msi")
        time.sleep(1)
        os.system("cls || clear")
        os.system("npm i pkg -g")
        time.sleep(1)
        os.system("cls || clear")
        print("[!] Convert To Exe....")
        os.system(f"pkg {file}")
        time.sleep(1)
        os.system("cls || clear")
        logo()


if __name__ == "__main__":
    logo()
    files = input("input the Java script File [Xequille.js]: ")
    convert(files)
