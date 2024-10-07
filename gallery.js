import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Initialize Supabase
const supabaseUrl = 'https://kfrjmqebnjwpnzafbwys.supabase.co';  // Replace with your Supabase URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmcmptcWVibmp3cG56YWZid3lzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNzkxMzE0OSwiZXhwIjoyMDQzNDg5MTQ5fQ.XTHT8deRRj95NbPu4zysBACmv9sj-_kSowKLJ6E-zMw';  // Replace with your public anon key
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const bucket = "photography.1";  // Your Supabase bucket name

// Placeholder image for new albums
const placeholderImageURL = 'album_placeholder.jpeg';

// Fetch and display folders in the gallery
export async function fetchFolders(galleryDiv, titleElement, backButton, onAlbumClick) {
    const { data: items, error } = await supabase.storage
        .from(bucket)
        .list('', { limit: 100 });

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

    // Filter out files and keep only folders (no extension in name)
    const folderList = items.filter(item => !item.name.includes('.'));

    folderList.forEach(async (folder) => {
        const albumCover = document.createElement('div');
        albumCover.classList.add('album-cover');

        // Fetch all files in the folder (album)
        const { data: mediaFiles, error: mediaError } = await supabase.storage
            .from(bucket)
            .list(folder.name, { limit: 100 });  // Get up to 100 files for randomization

        if (mediaError) {
            console.error(mediaError || 'No media found in the folder');
            return;
        }

        let mediaElement;
        let previewURL = placeholderImageURL;  // Default to the placeholder image

        // Filter out the .placeholder file
        const validFiles = mediaFiles.filter(file => file.name !== '.placeholder');

        if (validFiles.length > 0) {
            // Select a random file from the valid files
            const randomFile = validFiles[Math.floor(Math.random() * validFiles.length)];
            previewURL = supabase.storage.from(bucket).getPublicUrl(`${folder.name}/${randomFile.name}`).data.publicUrl;

            if (randomFile.name.match(/\.(mp4|mov|webm)$/i)) {
                // Create a video element for the video file
                mediaElement = document.createElement('video');
                mediaElement.src = previewURL;
                mediaElement.autoplay = true;  // Autoplay video
                mediaElement.muted = true;  // Mute video
                mediaElement.loop = true;  // Loop video
                mediaElement.playsInline = true;  // Play inline on mobile devices
                mediaElement.style.width = '100%';  // Make the video fit the container
                mediaElement.style.height = '100%';  // Ensure height fits as well
            } else {
                // Create an image element for the image file
                mediaElement = document.createElement('img');
                mediaElement.src = previewURL;
                mediaElement.style.width = '100%';
                mediaElement.style.height = '100%';  // Ensure it fits the container
            }
        } else {
            // If the album is empty (only .placeholder), use the placeholder image
            mediaElement = document.createElement('img');
            mediaElement.src = placeholderImageURL;
            mediaElement.style.width = '100%';
            mediaElement.style.height = '100%';
        }

        const titleElement = document.createElement('div');
        titleElement.classList.add('album-title');
        titleElement.textContent = folder.name;

        albumCover.appendChild(mediaElement);
        albumCover.appendChild(titleElement);

        // Add click event to open album view
        albumCover.addEventListener('click', () => onAlbumClick(folder.name));

        galleryDiv.appendChild(albumCover);
    });
}

// Fetch and display folders in the admin gallery
export async function fetchAdminFolders(galleryDiv, titleElement, backButton, onAlbumClick) {
    const { data: items, error } = await supabase.storage
        .from(bucket)
        .list('', { limit: 100 });

    if (error) {
        console.error(error);
        return;
    }

    galleryDiv.innerHTML = '';  // Clear existing content
    backButton.style.display = 'none';  // Hide back button on main page
    titleElement.textContent = "Manage Albums";  // Reset title

    if (items.length === 0) {
        galleryDiv.innerHTML = '<p>No albums found.</p>';
        return;
    }

    // Filter out files and keep only folders (no extension in name)
    const folderList = items.filter(item => !item.name.includes('.'));

    folderList.forEach(async (folder) => {
        const albumCover = document.createElement('div');
        albumCover.classList.add('album-cover');

        // Fetch all files in the folder (album)
        const { data: mediaFiles, error: mediaError } = await supabase.storage
            .from(bucket)
            .list(folder.name, { limit: 10 });

        if (mediaError) {
            console.error(mediaError || 'No media found in the folder');
            return;
        }

        let mediaElement;
        let previewURL = placeholderImageURL;  // Default to the placeholder image

        // If the folder contains files, display the first file as the album cover
        if (mediaFiles.length > 0 && !(mediaFiles.length === 1 && mediaFiles[0].name === '.placeholder')) {
            const firstFile = mediaFiles[0].name === '.placeholder' ? mediaFiles[1] : mediaFiles[0];
            previewURL = supabase.storage.from(bucket).getPublicUrl(`${folder.name}/${firstFile.name}`).data.publicUrl;

            if (firstFile.name.match(/\.(mp4|mov|webm)$/i)) {
                // Create a video element for the video file
                mediaElement = document.createElement('video');
                mediaElement.src = previewURL;
                mediaElement.autoplay = true;  // Autoplay video
                mediaElement.muted = true;  // Mute video
                mediaElement.loop = true;  // Loop video
                mediaElement.playsInline = true;  // Play inline on mobile devices
                mediaElement.style.width = '100%';  // Make the video fit the container
                mediaElement.style.height = '100%';  // Ensure height fits as well
            } else {
                // Create an image element for the image file
                mediaElement = document.createElement('img');
                mediaElement.src = previewURL;
                mediaElement.style.width = '100%';
                mediaElement.style.height = '100%';  // Ensure it fits the container
            }
        } else {
            // If the album is empty (only .placeholder), use the placeholder image
            mediaElement = document.createElement('img');
            mediaElement.src = placeholderImageURL;
            mediaElement.style.width = '100%';
            mediaElement.style.height = '100%';
        }

        const titleElement = document.createElement('div');
        titleElement.classList.add('album-title');
        titleElement.textContent = folder.name;

        // Add delete button (🗑️ icon) next to the album title
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '🗑️';  // Trash can icon
        deleteButton.classList.add('delete-album-button');
        deleteButton.style.marginLeft = '10px';  // Add some space between title and delete button

        // Delete album logic
        deleteButton.addEventListener('click', async (event) => {
            event.stopPropagation();  // Prevent the album from opening

            // Ask for confirmation before deleting the album
            const confirmDelete = confirm(`Are you sure you want to delete the album "${folder.name}"? This action cannot be undone.`);

            if (confirmDelete) {
                try {
                    // Delete all files in the folder (album)
                    const { data: albumFiles, error: listError } = await supabase.storage
                        .from(bucket)
                        .list(folder.name);

                    if (listError) {
                        console.error(`Error fetching files for album "${folder.name}":`, listError);
                        alert('Error deleting album files.');
                        return;
                    }

                    const filePaths = albumFiles.map(file => `${folder.name}/${file.name}`);

                    // Delete files from storage
                    const { error: deleteError } = await supabase.storage
                        .from(bucket)
                        .remove(filePaths);

                    if (deleteError) {
                        console.error(`Error deleting files for album "${folder.name}":`, deleteError);
                        alert('Error deleting album.');
                        return;
                    }

                    // Delete album entries from the 'images' table
                    const { error: dbDeleteError } = await supabase
                        .from('images')
                        .delete()
                        .eq('album_name', folder.name);

                    if (dbDeleteError) {
                        console.error('Error deleting album metadata:', dbDeleteError);
                        alert('Error deleting album data.');
                    } else {
                        alert(`Album "${folder.name}" deleted successfully!`);
                        fetchAdminFolders(galleryDiv, titleElement, backButton, onAlbumClick);  // Refresh the album view
                    }
                } catch (error) {
                    console.error('Unexpected error during album deletion:', error);
                    alert('An unexpected error occurred.');
                }
            } else {
                console.log('Album deletion canceled.');
            }
        });

        // Append media element and title to album cover
        albumCover.appendChild(mediaElement);
        albumCover.appendChild(titleElement);
        titleElement.appendChild(deleteButton);  // Append delete button next to the album title

        // Add click event to open album view
        albumCover.addEventListener('click', () => onAlbumClick(folder.name));

        galleryDiv.appendChild(albumCover);
    });
}

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
        .select('id, image_name, likes, type')
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
        const fileType = meta ? meta.type : 'unknown';  // Get the file type from the database (image or video)

        const mediaItem = document.createElement('div');
        mediaItem.classList.add('album-cover');  // Reuse the album cover class

        // Dynamically render an image or video element based on the file type
        if (fileType === 'image') {
            const imgElement = document.createElement('img');
            imgElement.src = publicURL;
            imgElement.style.width = '100%';
            imgElement.style.height = '100%';  // Ensure it fits the container
            mediaItem.appendChild(imgElement);
        } else if (fileType === 'video') {
            const videoElement = document.createElement('video');
            videoElement.src = publicURL;
            videoElement.autoplay = true;  // Autoplay video
            videoElement.muted = true;  // Mute video
            videoElement.loop = true;  // Loop video
            videoElement.playsInline = true;  // Play inline on mobile devices
            videoElement.style.width = '100%';  // Make the video fit the container
            videoElement.style.height = '100%';  // Ensure height fits as well
            mediaItem.appendChild(videoElement);
        }

        const infoElement = document.createElement('div');
        infoElement.innerHTML = `<button onclick="likeImage('${imageId}', this)">❤️</button> ${likes}`;

        mediaItem.appendChild(infoElement);
        galleryDiv.appendChild(mediaItem);
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