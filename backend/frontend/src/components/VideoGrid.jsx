import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { API_BASE_URL } from '../api';

const VideoGrid = () => {
  const { videos } = useData();
  const baseUrl = API_BASE_URL;

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6 pb-2.5 border-b-[3px] border-primary-red">
        <h2 className="text-3xl font-extrabold text-text-dark flex items-center">
          <i className="fas fa-video mr-2.5 text-primary-red"></i> Latest Videos
        </h2>
        <Link to="/latest-viral-videos" className="text-primary-red font-semibold no-underline text-sm hover:underline">
          View All Videos <i className="fas fa-arrow-right ml-1"></i>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {videos.slice(0, 4).map((video) => (
          <Link 
            key={video._id} 
            to={`/latest-viral-videos/${video.slug || video._id}`}
            className="bg-white rounded-lg overflow-hidden shadow-lg hover:-translate-y-1 transition-all group cursor-pointer no-underline text-inherit"
          >
            <div className="h-[160px] overflow-hidden relative">
              <img 
                src={video.image.startsWith('/uploads/') ? `${baseUrl}${video.image}` : video.image} 
                alt={video.title} 
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/70 w-[60px] h-[60px] rounded-full flex items-center justify-center text-white text-2xl transition-colors group-hover:bg-yellow-400 group-hover:text-slate-900 transition-all">
                <i className="fas fa-play ml-1"></i>
              </div>
              <div className="absolute top-2 right-2 flex gap-1">
                <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase text-white ${video.videoType === 'upload' ? 'bg-blue-600' : 'bg-red-600'}`}>
                    {video.videoType}
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="font-bold text-base mb-2 leading-tight group-hover:text-yellow-400 transition-colors line-clamp-1">
                {video.title}
              </div>
              <div className="flex justify-between text-text-gray text-[11px]">
                <span>{video.views} views</span>
                <span>{video.time}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default VideoGrid;
