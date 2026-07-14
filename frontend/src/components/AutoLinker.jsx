"use client";
import { useRouter } from 'next/navigation';
import React, { useMemo } from 'react';
;
import { useData } from '../context/DataContext';

const AutoLinker = ({ html, className = '' }) => {
  const { movies, celebs } = useData();
  const router = useRouter();

  // Build the dictionary of keywords to link
  const keywords = useMemo(() => {
    const list = [];

    // Add celebs
    (celebs || []).forEach(c => {
      if (c.name && c.name.length > 3) {
        list.push({
          keyword: c.name.trim(),
          url: `/celebrities/${c.slug || c._id}`
        });
      }
    });

    // Add movies
    (movies || []).forEach(m => {
      if (m.title && m.title.length > 3) {
        const isReleased = m.releaseDate && new Date(m.releaseDate) <= new Date();
        list.push({
          keyword: m.title.trim(),
          url: `${isReleased ? '/latest-movies' : '/latest-movies/upcoming'}/${m.slug || m._id}`
        });
      }
    });

    // Sort by length descending to match longest phrases first
    return list.sort((a, b) => b.keyword.length - a.keyword.length);
  }, [movies, celebs]);

  // Create a fast regex pattern combining all keywords
  const regex = useMemo(() => {
    if (keywords.length === 0) return null;
    const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = keywords.map(k => escapeRegex(k.keyword)).join('|');
    return new RegExp(`\\b(${pattern})\\b`, 'gi');
  }, [keywords]);

  // Handle clicks for auto-generated links to route through React Router
  const handleClick = (e) => {
    const target = e.target.closest('a[data-auto-link="true"]');
    if (target) {
      e.preventDefault();
      router.push(target.getAttribute('href'));
    }
  };

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const processedHtml = useMemo(() => {
    if (!html || !regex) return html || '';
    if (!mounted || typeof window === 'undefined') return html;

    // Parse the HTML using native DOMParser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html.replace(/&nbsp;|\u00a0/g, ' '), 'text/html');

    // Walker to find text nodes
    const walker = document.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        let parent = node.parentNode;
        while (parent && parent !== doc.body) {
          const tag = parent.tagName?.toLowerCase();
          if (['a', 'button', 'script', 'style', 'code'].includes(tag)) {
            return NodeFilter.FILTER_REJECT;
          }
          parent = parent.parentNode;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const nodesToReplace = [];
    let currentNode;
    while ((currentNode = walker.nextNode())) {
      nodesToReplace.push(currentNode);
    }

    nodesToReplace.forEach(node => {
      const text = node.nodeValue;
      if (regex.test(text)) {
        regex.lastIndex = 0; // reset regex
        const parts = text.split(regex);

        const fragment = document.createDocumentFragment();

        parts.forEach((part, index) => {
          if (index % 2 === 0) {
            fragment.appendChild(document.createTextNode(part));
          } else {
            const matchedKeyword = keywords.find(k => k.keyword.toLowerCase() === part.toLowerCase());
            if (matchedKeyword) {
              const a = document.createElement('a');
              a.href = matchedKeyword.url;
              a.className = "text-blue-600 hover:text-blue-800 underline font-bold transition-colors mx-1";
              a.setAttribute('data-auto-link', 'true');
              a.textContent = part;
              fragment.appendChild(a);
            } else {
              fragment.appendChild(document.createTextNode(part));
            }
          }
        });

        node.parentNode.replaceChild(fragment, node);
      }
    });

    return doc.body.innerHTML;
  }, [html, regex, keywords, mounted]);

  if (!html) return null;

  return (
    <div
      className={`rich-text-content ${className}`}
      dangerouslySetInnerHTML={{ __html: processedHtml }}
      onClick={handleClick}
    />
  );
};

export default AutoLinker;