import axios from "axios";
import { adminApi } from "../api/adminApi";

/**
 * @param file The file to upload
 * @returns The S3 key/path of the uploaded file
 */

export async function uploadFileToS3(file: File, key?: string): Promise<string> {
    const { presignedUrl, uniqueKey } = await adminApi.getUploadPresignedUrl(
        file.name,
        file.type,
        key
    );

    await axios.put(presignedUrl, file, {
        headers: { "Content-Type": file.type }
    });

    // Strip the 'pano/' prefix from the returned key. Since CloudFront maps the
    // domain directly to the 'pano' origin folder, the UI/DB must store the key without the prefix.
    return uniqueKey.replace(/^pano\//, "");
}