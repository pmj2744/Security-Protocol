from PIL import Image


END_MARKER = "<<<END_OF_MESSAGE>>>"


def text_to_bits(text):
    data = text.encode("utf-8")
    bits = ""

    for byte in data:
        bits += format(byte, "08b")

    return bits


def hide_message(image_path, text):
    output_path = "secure_image.png"

    message = text + END_MARKER
    bits = text_to_bits(message)

    image = Image.open(image_path).convert("RGB")
    pixels = list(image.getdata())

    capacity = len(pixels) * 3

    if len(bits) > capacity:
        raise ValueError("메시지가 너무 길어서 이미지에 숨길 수 없습니다.")

    new_pixels = []
    bit_index = 0

    for r, g, b in pixels:
        if bit_index < len(bits):
            r = (r & ~1) | int(bits[bit_index])
            bit_index += 1

        if bit_index < len(bits):
            g = (g & ~1) | int(bits[bit_index])
            bit_index += 1

        if bit_index < len(bits):
            b = (b & ~1) | int(bits[bit_index])
            bit_index += 1

        new_pixels.append((r, g, b))

    new_image = Image.new("RGB", image.size)
    new_image.putdata(new_pixels)
    new_image.save(output_path)

    return output_path