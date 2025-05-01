import { storage } from "./firebase.js"
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";


export const uploadVideoFirestore = async (blobUrl, fileName) => {
    const fileRef = storageRef(storage, `videos/${fileName}.mp4`);

    try {
        const snapshot = await uploadBytes(fileRef, blobUrl);
        const downloadUrl = await getDownloadURL(snapshot.ref);

        return downloadUrl;
    } catch (err) {
        console.error("Error uploading to cloud storage: ", err);

        throw err;
    }
}

export const downloadVideo = async (fileName) => {
    try {
        const fileRef = storageRef(storage, `videos/${fileName}.mp4`);
        const downloadUrl = await getDownloadURL(fileRef);

        return downloadUrl;
    } catch (err) {
        console.error("Error when fetching download URL", err);

        throw err;
    }
}