import React from 'react'
import { Link } from 'react-router-dom'
import { map, sortBy, reduce, groupBy } from 'lodash'
import styled from 'styled-components'
import { getRosterColor } from '../../../lib/player-color.js'

const TeamGroup = styled.ul`
    list-style-type: none;
    border: 1px solid #bbb;
    border-radius: 4px;
    font-size: 1.1rem;
    font-family: 'Palanquin', sans-serif;
    letter-spacing: 0.02rem;
    margin: 3px 0;
    padding: 4px;
`

const PlayerItem = styled.li`
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
    display: block;

    i {
        margin-left: 5px;
        font-size: 1.1rem;
        line-height: 0.5rem;
    }
`

const PlayerLink = ({ match, marks, player }) => {
    if (!marks.isPlayerHovered(player.get('name'))) return null
    return (
        <Link to={`/${player.get('name')}/${match.shardId}`}>
            <i className="fi-link" />
        </Link>
    )
}

class Roster extends React.Component {
    render() {
        const { match, telemetry, marks } = this.props

        const rosterPlayers = groupBy(telemetry.get('players'), p => p.get('rosterId'))
        const roster = reduce(rosterPlayers, (acc, players, id) => {
            acc[id] = sortBy(players, p => p.get('name'))
            return acc
        }, {})

        const sortedTeams = sortBy(Object.keys(roster), rosterId => {
            const players = roster[rosterId]
            if (players.find(p => marks.isPlayerFocused(p.get('name')))) return -10
            return -players.filter(p => p.get('status') !== 'dead').length
        })

        const teams = map(sortedTeams, rosterId => {
            const players = roster[rosterId]
            return (
                <TeamGroup key={rosterId}>
                    {players.map(p =>
                        <PlayerItem
                            key={p.get('name')}
                            onClick={() => marks.toggleTrackedPlayer(p.get('name'))}
                            onMouseEnter={() => marks.setHoveredPlayer(p.get('name'))}
                            onMouseLeave={() => marks.setHoveredPlayer(null)}
                            style={{
                                color: getRosterColor(marks, p),
                                textDecoration: marks.isPlayerTracked(p.get('name')) ? 'underline' : '',
                            }}
                        >
                            {p.get('name')} ({p.get('kills')})
                            <PlayerLink match={match} marks={marks} player={p} />
                        </PlayerItem>
                    )}
                </TeamGroup>
            )
        })

        return teams
    }
}

export default Roster
