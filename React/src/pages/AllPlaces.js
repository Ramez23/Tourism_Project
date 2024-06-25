import React, { useState, useEffect } from "react";
import axios from 'axios';
import CardPlace from "../components/CardPlace";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { Scroll } from "../func/Scroll";
import ScreenSize from "../func/ScreenSize";
import FloatNav from '../components/Float-nav';
import CategoryPart from "../components/Category_part";
import { useLocation } from "react-router-dom";

export default function All() {
    const isMobile = ScreenSize();
    const isScrolled = Scroll(250);

    // State variables for filtering and data
    const [filterCriteria, setFilterCriteria] = useState([]);
    const [places, setPlaces] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const location = useLocation();

    // Extract query parameter and initialize filter criteria
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const locationFilter = params.get('location');
        if (locationFilter) {
            setFilterCriteria(locationFilter.split(','));
        }
        console.log(filterCriteria.length)
    }, [location]);
    // Fetch places from API
    useEffect(() => {
        const fetchPlaces = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/v1/place');
                setPlaces(response.data);
                setFilteredData(response.data); // Initialize filteredData with all places
                console.log('Fetched places:', response.data);
            } catch (error) {
                console.error('Error fetching places:', error);
            }
        };

        fetchPlaces();
    }, []);

    // Filter function
    useEffect(() => {
        if (filterCriteria.length > 0) {
            const filtered = places.filter(item =>
                filterCriteria.some(criteria => item.location.toLowerCase().includes(criteria.toLowerCase()) || item.tourism.toLowerCase().includes(criteria.toLowerCase()))
            );
            setFilteredData(filtered);
        } else {
            setFilteredData(places); // Show all places if no filter is applied
        }
    }, [filterCriteria, places]);

    // Handle dropdown change
    const handleDropdownChange = (e) => {
        const selectedCriteria = e.target.value;
        if (selectedCriteria) {
            setFilterCriteria([selectedCriteria]);
        } else {
            setFilterCriteria([]); // Clear filter if 'All' is selected
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            const elements = document.querySelectorAll('.filter-options, .card-rec-hist');
            elements.forEach(element => {
                const rect = element.getBoundingClientRect();
                if (rect.top < window.innerHeight - 100) {
                    element.classList.add('visible');
                }
            });
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Trigger the scroll handler once on mount

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            {isScrolled ? <FloatNav /> : <Nav />}
            {/* Filter select */}
            {isMobile ?
                <CategoryPart img='allver.jpg' h2='Our Marvelous Egypt' h3="Discover places to visit!" />
                :
                <CategoryPart img='all.jpg' h2='Our Marvelous Egypt' h3="Discover places to visit!" />
            }
            <div className="places-whole">
                <div className="filter-options">
                    <select
                        className="select-dropdown"
                        value={filterCriteria[0] || ''}
                        onChange={handleDropdownChange}
                    >
                        <option value="">All</option>
                        <option value="Adventure">Adventure Tourism</option>
                        <option value="Historical">Historical Tourism</option>
                        <option value="Cultural">Cultural Tourism</option>
                        <option value="Medical">Medical Tourism</option>
                        <option value="Nautical">Nautical Tourism</option>
                        <option value="Religious">Religious Tourism</option>
                    </select>
                </div>
                {/* Display filtered data */}
                {filteredData.map(place => (
                    <CardPlace
                        key={place._id}
                        place={place} // Adjust based on the API response
                    />
                ))}
            </div>
            <Footer name='footer-main' />
        </>
    );
}
