from PIL import Image
from stego import hide_message

# 테스트용 흰색 이미지 만들기
Image.new("RGB", (300, 300), (255, 255, 255)).save("test_image.png")

# 이미지에 비밀 메시지 숨기기
result = hide_message("test_image.png", "hello security")

print("생성된 파일:", result)