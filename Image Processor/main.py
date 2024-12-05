import cv2
import numpy as np
import tkinter as tk
from tkinter import filedialog
from PIL import Image, ImageTk
import matplotlib.pyplot as plt

class ImageProcessorApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Image Processor")
        
        self.load_button = tk.Button(root, text="Load Image", command=self.load_image)
        self.load_button.pack()
        
        self.threshold_button = tk.Button(root, text="Apply Thresholding", command=self.apply_threshold)
        self.threshold_button.pack()
        
        self.sharpen_button = tk.Button(root, text="Apply Sharpening", command=self.apply_sharpening)
        self.sharpen_button.pack()
        
        self.image_label = tk.Label(root)
        self.image_label.pack()
        
        self.image = None 

    def load_image(self):
        file_path = filedialog.askopenfilename()
        if file_path:
            self.image = cv2.imread(file_path, 0)  
            self.display_image(self.image)

    def display_image(self, image):
        image_rgb = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)
        im_pil = Image.fromarray(image_rgb)
        imgtk = ImageTk.PhotoImage(im_pil)
        self.image_label.config(image=imgtk)
        self.image_label.image = imgtk

    def apply_threshold(self):
        if self.image is None:
            return
        #Глобальный порог
        _, thresh1 = cv2.threshold(self.image, 127, 255, cv2.THRESH_BINARY)
        # Порог по Оцу
        _, thresh2 = cv2.threshold(self.image, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        plt.figure(figsize=(10, 5))
        plt.subplot(1, 3, 1), plt.imshow(self.image, cmap='gray'), plt.title('Original')
        plt.subplot(1, 3, 2), plt.imshow(thresh1, cmap='gray'), plt.title('Global Threshold')
        plt.subplot(1, 3, 3), plt.imshow(thresh2, cmap='gray'), plt.title('Otsu Threshold')
        plt.show()

    def apply_sharpening(self):
        if self.image is None:
            return
    
        blurred_image = cv2.GaussianBlur(self.image, (5, 5), 0)
    
        sharpened_image = cv2.addWeighted(self.image, 1.5, blurred_image, -0.5, 0)

        plt.figure(figsize=(10, 5))
        plt.subplot(1, 2, 1), plt.imshow(self.image, cmap='gray'), plt.title('Original')
        plt.subplot(1, 2, 2), plt.imshow(sharpened_image, cmap='gray'), plt.title('Sharpened Image')
        plt.show()

root = tk.Tk()
app = ImageProcessorApp(root)
root.mainloop()
