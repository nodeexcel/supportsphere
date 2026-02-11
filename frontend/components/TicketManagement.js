import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TicketManagement = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await axios.get('/api/tickets');
                setTickets(response.data);
            } catch (err) {
                setError('Failed to fetch tickets');
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, []);

    const handleTicketUpdate = async (ticketId, status) => {
        try {
            await axios.put(`/api/tickets/${ticketId}`, { status });
            setTickets(tickets.map(ticket => ticket.id === ticketId ? { ...ticket, status } : ticket));
        } catch (err) {
            setError('Failed to update ticket');
        }
    };

    const fetchSuggestions = async (ticketId) => {
        try {
            const response = await axios.get(`/api/suggestions/${ticketId}`);
            setSuggestions(response.data);
        } catch (err) {
            setError('Failed to fetch suggestions');
        }
    };

    if (loading) return <div>Loading tickets...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <h1>Ticket Management</h1>
            <ul>
                {tickets.map(ticket => (
                    <li key={ticket.id}>
                        <div>
                            <strong>{ticket.title}</strong> - {ticket.status}
                            <button onClick={() => handleTicketUpdate(ticket.id, 'resolved')}>Resolve</button>
                            <button onClick={() => fetchSuggestions(ticket.id)}>Get Suggestions</button>
                        </div>
                        {suggestions.length > 0 && (
                            <div>
                                <h3>Suggestions:</h3>
                                <ul>
                                    {suggestions.map((suggestion, index) => (
                                        <li key={index}>{suggestion}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TicketManagement;