import requests
#coded by frostedflakes666
def save_content_from_links(links, destination_file):
    with open(destination_file, 'a') as file:
        for link in links:
            response = requests.get(link)
            content = response.text
            file.write(content)

    print(f"Content saved from {len(links)} links to {destination_file}. coded by FrostedFlakes666")


links = ['https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt', 'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/http.txt', 'https://raw.githubusercontent.com/clarketm/proxy-list/master/proxy-list-raw.txt',' https://api.proxyscrape.com/v2/?request=displayproxies&protocol=http&timeout=10000&country=all&ssl=all&anonymity=all','https://www.proxy-list.download/api/v1/get?type=http','https://raw.githubusercontent.com/saisuiu/uiu/main/free.txt','https://raw.githubusercontent.com/mmpx12/proxy-list/master/https.txt']
destination_directory = 'saved_content'  # Replace with the desired destination directory
#hey fat ass niggas here you go cause yall cant fucking code ez code like this 
save_content_from_links(links, destination_directory)