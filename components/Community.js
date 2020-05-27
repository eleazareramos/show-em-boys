import Cards from "./Cards"
import numeral from 'numeral'

const createStyles = () => {
  return {
    container: {
      display: 'flex',
      alignItems: 'center',
      padding: '10px 20px'
    },
    pot: {
      color: 'white',
      marginRight: 10
    },

  }
}

const Community = props => {

  const { game, cards } = props
  const styles = createStyles()
  return (
    <div style={styles.container}>
      <h1 style={styles.pot}>{numeral(game.pot).format('$#,#00.00')}</h1>
      <Cards cards={game.cards || []} revealed={true}/>
    </div>
  )

}

export default Community