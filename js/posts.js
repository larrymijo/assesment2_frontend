// js/posts.js
// THE SLAP - Posts Page
// Fetches posts, users, and comments using async/await and displays them dynamically

/*
 * posts.js
 * Purpose: Manages the posts page functionality including:
 * - Fetching and displaying posts
 * - Loading user profiles
 * - Managing comments
 * - Implementing infinite scroll
 */

/* ------------------------- CONSTANTS & STATE ------------------------- */
// API endpoint for all data fetching
const API_BASE = 'https://dummyjson.com';
const POSTS_LIMIT = 5; // Number of posts to load per request

// State management for pagination and data
let postsSkip = 0;      // Tracks how many posts we've loaded
let isLoading = false;  // Prevents multiple simultaneous loads
let usersCache = [];    // Stores user data to avoid repeated fetches

// DOM references
const postsContainer = document.getElementById('posts-container');
const loadMoreBtn = document.getElementById('load-more');
const userModal = document.getElementById('user-modal');
const userProfileDiv = document.getElementById('user-profile');
const closeModalBtn = document.getElementById('close-modal');

/* ------------------------- CLASSES ------------------------- */
class User {
    constructor(raw) {
        this.id = raw.id;
        this.name = `${raw.firstName} ${raw.lastName}`;
        this.username = raw.username;
        this.email = raw.email;
        this.phone = raw.phone;
        this.address = raw.address
        ? `${raw.address.address || ''}, ${raw.address.city || ''}`
        : 'N/A';
        this.company = raw.company?.name || '';
        
        this.hair = raw.hair;
    }
}

class Post {
    constructor(raw, user) {
        this.id = raw.id;
        this.title = raw.title;
        this.body = raw.body;
        this.tags = raw.tags || [];
        // Extract likes from reactions object or default to 0
        this.likes = raw.reactions?.likes || 0;
        this.dislikes = raw.reactions?.dislikes || 0;
        this.user = user;
    }

    createDOMElement() {
        // Create main article element
        const article = document.createElement('article');
        article.className = 'post-card';
        article.id = `post-${this.id}`;

        // Create and append title
        const title = document.createElement('h2');
        title.textContent = this.title;
        article.appendChild(title);

        // Create and append body
        const body = document.createElement('p');
        body.textContent = this.body;
        article.appendChild(body);

        // Create meta section (username and reactions)
        const meta = document.createElement('p');
        meta.className = 'post-meta';

        // Create username button
        const userBtn = document.createElement('button');
        userBtn.className = 'username-link';
        userBtn.dataset.userId = this.user.id;
        userBtn.textContent = this.user.name;
        meta.appendChild(userBtn);

        // Create reactions span
        const reactions = document.createElement('span');
        reactions.className = 'reactions';

        // Add likes
        const likes = document.createElement('span');
        likes.title = 'Likes';
        likes.textContent = `❤️ ${this.likes} `;
        reactions.appendChild(likes);

        // Add dislikes
        const dislikes = document.createElement('span');
        dislikes.title = 'Dislikes';
        dislikes.textContent = `👎 ${this.dislikes}`;
        reactions.appendChild(dislikes);

        meta.appendChild(reactions);
        article.appendChild(meta);

        // Create tags section
        const tagsDiv = document.createElement('div');
        tagsDiv.className = 'tags';
        this.tags.forEach(tag => {
            const tagSpan = document.createElement('span');
            tagSpan.className = 'tag';
            tagSpan.textContent = `#${tag}`;
            tagsDiv.appendChild(tagSpan);
        });
        article.appendChild(tagsDiv);

        // Create comments section
        const comments = document.createElement('div');
        comments.className = 'comments';
        comments.id = `comments-${this.id}`;
        const loadingText = document.createElement('em');
        loadingText.textContent = 'Loading comments...';
        comments.appendChild(loadingText);
        article.appendChild(comments);

        return article;

    }
}

/* ------------------------- FETCH HELPERS ------------------------- */
async function fetchUsersForPosts(posts) {
    // Extract unique user IDs from posts
    const userIds = [...new Set(posts.map(post => post.userId))];
    
    // Filter out users already in cache
    const userIdsToFetch = userIds.filter(id => !usersCache.find(u => u.id === id));
    
    // Fetch all users in parallel using Promise.all
    const userPromises = userIdsToFetch.map(async (userId) => {
        try {
            const res = await fetch(`${API_BASE}/users/${userId}`);
            const userData = await res.json();
            return new User(userData);
        } catch (err) {
            console.error(`Error fetching user ${userId}:`, err);
            return null;
        }
    });
    
    const newUsers = await Promise.all(userPromises);
    usersCache.push(...newUsers.filter(u => u !== null));
}

async function fetchPosts(limit = POSTS_LIMIT, skip = 0) {
    try {
        const res = await fetch(`${API_BASE}/posts?limit=${limit}&skip=${skip}`);
        const data = await res.json();
        return data.posts || [];
    } catch (err) {
        console.error('Error fetching posts:', err);
        return [];
    }
}

async function fetchComments(postId) {
    try {
        const res = await fetch(`${API_BASE}/comments/post/${postId}`);
        const data = await res.json();
        return data.comments || [];
    } catch (err) {
        console.error(`Error fetching comments for post ${postId}:`, err);
        return [];
    }
}

/* ------------------------- RENDERING ------------------------- */
async function renderPosts() {
    if (isLoading) return;
    isLoading = true;
    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = 'Loading...';

    try {
        const rawPosts = await fetchPosts(POSTS_LIMIT, postsSkip);
        if (!rawPosts.length) {
            loadMoreBtn.style.display = 'none';
            const noPostsMsg = document.createElement('p');
            noPostsMsg.className = 'no-content-message';
            noPostsMsg.textContent = 'No more posts to load.';
            postsContainer.appendChild(noPostsMsg);
            return;
        }

        // Fetch users for the current batch of posts
        await fetchUsersForPosts(rawPosts);

        for (const raw of rawPosts) {
            const user = usersCache.find(u => u.id === raw.userId) || new User({
                id: raw.userId,
                firstName: 'Unknown',
                lastName: '',
                username: 'N/A',
                email: 'N/A'
            });
            const post = new Post(raw, user);
            const postElement = post.createDOMElement();
            postsContainer.appendChild(postElement);

            // Fetch comments asynchronously for each post
            (async () => {
                try {
                    const comments = await fetchComments(post.id);
                    const commentsEl = document.getElementById(`comments-${post.id}`);
                    if (!commentsEl) return;

                    // Clear loading message
                    commentsEl.textContent = '';

                    if (!comments.length) {
                        const noComments = document.createElement('p');
                        const emText = document.createElement('em');
                        emText.textContent = 'No comments yet';
                        noComments.appendChild(emText);
                        commentsEl.appendChild(noComments);
                    } else {
                        comments.forEach(comment => {
                            const commentDiv = document.createElement('div');
                            commentDiv.className = 'comment';
                            
                            const username = document.createElement('strong');
                            username.textContent = comment.user.username;
                            
                            const commentText = document.createTextNode(`: ${comment.body}`);
                            
                            commentDiv.appendChild(username);
                            commentDiv.appendChild(commentText);
                            commentsEl.appendChild(commentDiv);
                        });
                    }
                } catch (error) {
                    const commentsEl = document.getElementById(`comments-${post.id}`);
                    if (commentsEl) {
                        const errorMsg = document.createElement('p');
                        errorMsg.className = 'error-message';
                        errorMsg.textContent = 'Error loading comments. Please try again later.';
                        commentsEl.appendChild(errorMsg);
                    }
                    console.error('Error fetching comments:', error);
                }
            })();
        }
        postsSkip += rawPosts.length;
    } catch (error) {
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.textContent = 'Error loading posts. Please try again later.';
        postsContainer.appendChild(errorMsg);
        console.error('Error fetching posts:', error);
    } finally {
        isLoading = false;
        loadMoreBtn.disabled = false;
        loadMoreBtn.textContent = 'Load more';
    }
}

/* ------------------------- MODAL ------------------------- */
function openUserModal(userId) {
    const user = usersCache.find(u => u.id == userId);
    if (!user) return;

    // Clear previous content
    userProfileDiv.textContent = '';

    // Create and append name heading
    const name = document.createElement('h2');
    name.textContent = user.name;
    name.id = 'user-modal-title';
    userProfileDiv.appendChild(name);

    // Create and append user details
    const details = [
        { label: 'Username', value: user.username },
        { label: 'Email', value: user.email },
        { label: 'Phone', value: user.phone },
        { label: 'Address', value: user.address },
        { label: 'Company', value: user.company },

        //
        { label: 'hair', value: `${user.hair.color} (${user.hair.type})` },
    ];

    details.forEach(detail => {
        const p = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = `${detail.label}: `;
        p.appendChild(strong);
        p.appendChild(document.createTextNode(detail.value));
        userProfileDiv.appendChild(p);
    });

    userModal.setAttribute('aria-hidden', 'false');
    userModal.classList.add('open');
}

function closeUserModal() {
    userModal.setAttribute('aria-hidden', 'true');
    userModal.classList.remove('open');
}

/* ------------------------- EVENTS ------------------------- */
document.addEventListener('click', e => {
    const userBtn = e.target.closest('.username-link');
    if (userBtn) openUserModal(userBtn.dataset.userId);
});

closeModalBtn.addEventListener('click', closeUserModal);
userModal.addEventListener('click', e => {
    if (e.target === userModal) closeUserModal();
});

loadMoreBtn.addEventListener('click', renderPosts);

/* ------------------------- INIT ------------------------- */
(async function init() {
    await renderPosts();
})();




//button 

const topBtn = document.createElement('button')
topBtn.textContent = 'Topi';
document.body.appendChild(topBtn);

topBtn.style.position = 'fixed';
topBtn.style.bottom = '20px';
topBtn.style.right = '20px';

topBtn.style.display = 'none';
window.addEventListener('scroll', () =>{
    if (window.scrollY > 200) {
        topBtn.style.display = 'block';
    } else {
        topBtn.style.display = 'none';
    }
});

topBtn.addEventListener('click', () => {
    window.scrollTo({top: 0, behavior: "smooth"})
});




