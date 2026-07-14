const fs = require('fs');

const path = 'src/context/DataContext.jsx';
let content = fs.readFileSync(path, 'utf8');

const target = `      const results = await Promise.all([
        api.getMovies().finally(increment),
        api.getNews().finally(increment),
        api.getTodayNews().finally(increment),
        api.getCelebrities().finally(increment),
        api.getVideos().finally(increment),
        api.getAnnouncements().finally(increment)
      ]);`;

const replacement = `      const results = await Promise.all([
        api.getMovies().catch(e => ({ data: [] })).finally(increment),
        api.getNews().catch(e => ({ data: [] })).finally(increment),
        api.getTodayNews().catch(e => ({ data: [] })).finally(increment),
        api.getCelebrities().catch(e => ({ data: [] })).finally(increment),
        api.getVideos().catch(e => ({ data: [] })).finally(increment),
        api.getAnnouncements().catch(e => ({ data: [] })).finally(increment)
      ]);`;

if(content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(path, content, 'utf8');
    console.log('Fixed DataContext Promise.all logic successfully!');
} else {
    console.log('Target not found in DataContext!');
}
