import { Injectable, BadRequestException } from '@nestjs/common';
import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import toStream = require('buffer-to-stream');

@Injectable()
export class CloudinaryService {
  /**
   * It takes an image file, uploads it to Cloudinary, and returns a promise that resolves to the
   * response from Cloudinary
   * @param image - Express.Multer.File - This is the image that was uploaded by the user.
   * @returns A promise that resolves to an UploadApiResponse
   */
  async uploadImage(image: Express.Multer.File): Promise<UploadApiResponse> {
    try {
      return new Promise((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream(
          {
            folder: 'programmer-profile-pfp',
            format: 'jpg',
            width: 500,
            height: 500,
            crop: 'fill',
            compression: 'high',
          },
          (error, result) => {
            if (error) reject(error);
            resolve(result);
          },
        );
        toStream(image.buffer).pipe(upload);
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * It takes a publicId as an argument, and then it deletes the image from cloudinary.
   * @param {string} publicId - The public ID of the image you want to delete.
   * @returns The response from the cloudinary API.
   */
  async deleteImage(publicId: string): Promise<UploadApiResponse> {
    try {
      return cloudinary.uploader.destroy(publicId);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
