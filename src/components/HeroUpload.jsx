import { uploadHeroToAppwrite } from '../lib/appwrite';
import { useStore } from '../store/useStore';

export default function HeroUpload() {
  const hero = useStore((state) => state.postData.hero_image);
  const updatePostData = useStore((state) => state.updatePostData);

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const uploadedUrl = await uploadHeroToAppwrite(file);
      updatePostData({ hero_image: uploadedUrl.toString() });
    } catch {
      updatePostData({ hero_image: URL.createObjectURL(file) });
    }
  };

  return (
    <div className="hero-upload">
      <label htmlFor="hero-upload-input" className="upload-box">
        <span className="upload-icon">⬆</span>
        <span>File Upload</span>
      </label>
      <input id="hero-upload-input" type="file" accept="image/*" onChange={handleUpload} hidden />
      {hero ? <img src={hero} alt="hero preview" className="hero-preview" /> : null}
    </div>
  );
}
