import os
import sys 
#coded by frostedflakes666
combolist = sys.argv[1].upper()


def copy_combos(source_file, destination_file):
    with open(source_file, 'r') as source:
        combos = source.readlines()

    with open(destination_file, 'a') as destination:
        destination.writelines(combos)

    print(f"Combos copied from {source_file} to {destination_file}. Coded By FrostedFlakes666 SKIDDDSS")

# Example usage
source_file = combolist  # Replace with the actual name of your source file
destination_file = 'destination_combos.txt'  # Replace with the desired name of the destination file
#very simple code ez 
copy_combos(source_file, destination_file)