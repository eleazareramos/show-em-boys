import Cards from './Cards'
import numeral from 'numeral'

const createStyles = () => {
  return {
    container: {
      display: 'flex',
      alignItems: 'center',
      padding: '20px',
    },
    pot: {
      color: 'white',
      marginRight: 10,
    },
    plus: {
      color: 'white',
      fontSize: 18,
      padding: '5px 10px',
      backgroundColor: 'green',
      borderRadius: '5px',
      marginRight: 10,
      textAlign: 'center',
    },
  }
}

const Community = (props) => {
  const { game, playerBets } = props
  const styles = createStyles()
  return (
    <div style={styles.container}>
      <div>
        <h1 style={styles.pot}>{numeral(game.pot).format('$#,#00.00')}</h1>
        {playerBets > 0 ? (
          <h1 style={styles.plus}>
            + {numeral(playerBets).format('$#,#00.00')}
          </h1>
        ) : null}
      </div>
      <Cards cards={game.cards || []} revealed={true} />
    </div>
  )
}

export default Community
