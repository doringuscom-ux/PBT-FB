const fs = require('fs'); 
let code = fs.readFileSync('frontend/src/App.jsx', 'utf8'); 

const importsToReplace = [
  'AdminLayout', 'MainLayout', 'Dashboard', 'ManageMovies', 'ManageNews', 'ManageCelebs', 
  'ManageVideos', 'ManageUsers', 'ManageComments', 'AdminLogin', 'ManageSports', 'SEOManager', 
  'ManageSubscribers', 'ManageInquiries', 'ManageRedirects', 'ManageUpcoming', 
  'NewsList', 'NewsDetail', 'MovieList', 'MovieDetail', 'ActorDetail', 'CelebList', 'CelebDetail', 
  'VideosList', 'VideoDetail', 'TodayNews', 'SearchPage', 'SportsList', 'UpcomingList', 
  'ContactUs', 'AboutUs', 'PrivacyPolicy', 'Disclaimer', 'BoxOffice', 'SubmitContent', 'NotFound'
]; 

importsToReplace.forEach(component => { 
  const regex = new RegExp(`import ${component} from '([^']+)';`, 'g'); 
  code = code.replace(regex, `const ${component} = React.lazy(() => import('$1'));`); 
}); 

if (!code.includes('import React, { Suspense }')) { 
  code = "import React, { Suspense } from 'react';\n" + code; 
} 

code = code.replace('<Routes>', '<Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#050505] text-white font-bold tracking-widest uppercase">Loading...</div>}>\n          <Routes>'); 
code = code.replace('</Routes>', '</Routes>\n        </Suspense>'); 

fs.writeFileSync('frontend/src/App.jsx', code);
