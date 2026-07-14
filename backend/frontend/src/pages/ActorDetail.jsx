import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';

const ActorDetail = () => {
    const { name } = useParams();
    const { movies } = useData();
    const actorName = decodeURIComponent(name);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [name]);

    // Find all movies this actor is in
    const actorMovies = movies.filter(movie => 
        movie.cast && movie.cast.some(member => member.name.toLowerCase() === actorName.toLowerCase())
    );

    // Get actor info from the first movie found (image, etc)
    const actorInfo = actorMovies.length > 0 
        ? actorMovies[0].cast.find(member => member.name.toLowerCase() === actorName.toLowerCase())
        : null;

    if (actorMovies.length === 0) {
        return <div className="p-20 text-center font-bold text-slate-400 uppercase tracking-widest">No movies found for this actor</div>;
    }

    return (
        <div className="bg-white min-h-screen">
            <div className="bg-slate-900 text-white py-20 px-5">
                <div className="page-container flex flex-col md:flex-row items-center gap-10">
                    <div className="w-40 h-40 md:w-56 md:h-56 rounded-full border-4 border-primary-red p-2 shadow-2xl shrink-0">
                        <img 
                            src={actorInfo?.image || 'https://res.cloudinary.com/dzvk7womv/image/upload/v1711287600/default_actor.jpg'} 
                            alt={actorName} 
                            className="w-full h-full object-cover object-top rounded-full"
                        />
                    </div>
                    <div className="text-center md:text-left">
                        <div className="text-primary-red text-sm font-black uppercase tracking-[0.3em] mb-4 italic">Actor Profile</div>
                        <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-4">{actorName}</h1>
                        <p className="text-slate-400 max-w-2xl font-medium leading-relaxed italic">
                            A prominent figure in the industry, {actorName} has delivered standout performances across multiple blockbuster titles. Known for versatility and charismatic screen presence.
                        </p>
                    </div>
                </div>
            </div>

            <main className="page-container py-12">
                <div className="flex items-center gap-3 mb-12">
                    <span className="w-10 h-1.5 bg-primary-red"></span>
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">Filmography</h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {actorMovies.map(movie => {
                        const isReleased = movie.releaseDate && new Date(movie.releaseDate) <= new Date();
                        return (
                        <Link key={movie._id} to={`${isReleased ? '/latest-movies' : '/latest-movies/upcoming'}/${movie.slug || movie._id}`} className="group no-underline">
                            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-4 shadow-lg border border-slate-100 group-hover:-translate-y-2 transition-transform duration-500">
                                <img src={movie.image} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                                <div className="absolute bottom-4 left-4 right-4">
                                    <div className="text-xs font-black text-white uppercase tracking-tighter line-clamp-2">{movie.title}</div>
                                    <div className="text-[10px] text-primary-red font-black uppercase mt-1 italic">{movie.genre}</div>
                                </div>
                            </div>
                        </Link>
                        );
                    })}
                </div>
            </main>
        </div>
    );
};

export default ActorDetail;
