import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Initialize Supabase
const supabaseUrl = 'https://kfrjmqebnjwpnzafbwys.supabase.co';  // Replace with your Supabase URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmcmptcWVibmp3cG56YWZid3lzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNzkxMzE0OSwiZXhwIjoyMDQzNDg5MTQ5fQ.XTHT8deRRj95NbPu4zysBACmv9sj-_kSowKLJ6E-zMw';  // Replace with your public anon key
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const bucket = "photography.1";  // Your Supabase bucket name

// Fetch and display folders in the gallery
export async function fetchFolders(galleryDiv, titleElement, backButton, onAlbumClick) {
    const { data: items, error } = await supabase.storage
        .from(bucket)
        .list('', { limit: 100, sortBy: { column: 'name' } });

    if (error) {
        console.error(error);
        return;
    }

    galleryDiv.innerHTML = '';  // Clear existing content
    backButton.style.display = 'none';  // Hide back button on main page
    titleElement.textContent = "Leila's Photography Gallery";  // Reset title

    if (items.length === 0) {
        galleryDiv.innerHTML = '<p>No albums found.</p>';
        return;
    }

    const folderList = items.filter(item => !item.name.includes('.'));

    folderList.forEach(async (folder) => {
        const albumCover = document.createElement('div');
        albumCover.classList.add('album-cover');

        // Fetch the first image from the folder
        const { data: images, error: imageError } = await supabase.storage
            .from(bucket)
            .list(folder.name, { limit: 1 });

        if (imageError || images.length === 0) {
            console.error(imageError || 'No images found in the folder');
            return;
        }

        const firstImageURL = supabase.storage.from(bucket).getPublicUrl(`${folder.name}/${images[0].name}`).data.publicUrl;

        const imgElement = document.createElement('img');
        imgElement.src = firstImageURL;

        const titleElement = document.createElement('div');
        titleElement.textContent = folder.name;

        albumCover.appendChild(imgElement);
        albumCover.appendChild(titleElement);

        albumCover.addEventListener('click', () => onAlbumClick(folder.name));

        galleryDiv.appendChild(albumCover);
    });
}

// Fetch images for a specific album
export async function fetchAlbumImages(albumName, galleryDiv, titleElement, backButton, onLikeClick) {
    const { data: images, error } = await supabase.storage
        .from(bucket)
        .list(albumName, { limit: 100 });

    if (error) {
        console.error(error);
        return;
    }

    galleryDiv.innerHTML = '';  // Clear current gallery

    const { data: metadata, error: metaError } = await supabase
        .from('images')
        .select('id, image_name, likes')
        .eq('album_name', albumName);

    if (metaError) {
        console.error('Error fetching image metadata:', metaError);
        return;
    }

    images.forEach(async (file) => {
        const publicURL = supabase.storage.from(bucket).getPublicUrl(`${albumName}/${file.name}`).data.publicUrl;
        const meta = metadata.find(m => m.image_name === file.name);
        const likes = meta ? meta.likes : 0;
        const imageId = meta ? meta.id : null;

        const imageItem = document.createElement('div');
        imageItem.classList.add('album-cover');

        const imgElement = document.createElement('img');
        imgElement.src = publicURL;

        const infoElement = document.createElement('div');
        infoElement.innerHTML = `<button onclick="likeImage('${imageId}', this)">❤️</button> ${likes}`;

        imageItem.appendChild(imgElement);
        imageItem.appendChild(infoElement);
        galleryDiv.appendChild(imageItem);
    });

    titleElement.textContent = albumName;
    backButton.style.display = 'block';
}

// Like an image
export async function likeImage(imageId, button) {
    if (!imageId) {
        console.error('Invalid image ID for liking');
        return;
    }

    const { data: currentData, error: currentError } = await supabase
        .from('images')
        .select('likes')
        .eq('id', imageId)
        .single();

    if (currentError) {
        console.error('Error fetching current likes:', currentError);
        return;
    }

    const newLikes = currentData.likes + 1;

    const { data, error } = await supabase
        .from('images')
        .update({ likes: newLikes })
        .eq('id', imageId)
        .select('likes');

    if (error) {
        console.error('Error updating likes:', error);
        return;
    }

    if (data && data.length > 0) {
        button.parentElement.innerHTML = `<button onclick="likeImage('${imageId}', this)">❤️</button> ${data[0].likes}`;
    }
}