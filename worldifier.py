from PIL import Image
import sys
import json

if (len(sys.argv) < 2):
    print("Provide a path to an image to convert")
    exit()

img = Image.open(sys.argv[1]).convert(mode="I")
width, height = img.size
pixels = img.load()

colour_tile_map = {255:"floor", 0:"pit", 204:"thin vines", 76:"thick vines", 82:"wall", 50:"illusory wall", 67:"dry vines", 138:"lava", 203:"exit"}

world_arr = []

for x in range(0, width):
    row = []
    for y in range(0, height):
        # print(pixels[x,y])
        try :
            row.append("{\"tile\":\"" + colour_tile_map[pixels[x,y]] + "\"}")
        except :
            print(str(pixels[x,y]) + " not a valid tile")
            exit()
    world_arr.append("[" + ",".join(row) + "]")

world_str = "[" + ",".join(world_arr) + "]"

print(world_str)
