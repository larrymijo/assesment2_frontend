/*
 * main.js
 * Purpose: Handles the navigation active state highlighting
 * This script runs on all pages to highlight the current page in the navigation menu
 */

// Get the current page path from the URL (e.g., '/contact.html')
const currentPage = window.location.pathname;

// Select all navigation links in the navbar
const navLinks = document.querySelectorAll('.navbar-pages a');

// Add 'active' class to the current page link
navLinks.forEach(link => {
    // Extract just the filename from the href attribute and compare with current page
    if (link.getAttribute('href') === currentPage.split('/').pop()) {
        link.classList.add('active'); // Highlight the current page link
    }
});
