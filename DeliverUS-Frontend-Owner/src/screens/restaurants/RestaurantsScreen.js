/* eslint-disable react/prop-types */
import React, { useContext, useEffect, useState } from 'react'
import { StyleSheet, View, FlatList, Pressable } from 'react-native'
import TextRegular from '../../components/TextRegular'
import { getAll } from '../../api/RestaurantEndpoints'
import * as GlobalStyles from '../../styles/GlobalStyles'
import ImageCard from '../../components/ImageCard'
import TextSemiBold from '../../components/TextSemibold'
import { API_BASE_URL } from '@env'
import restaurantLogo from '../../../assets/restaurantLogo.jpeg'
import { showMessage } from 'react-native-flash-message'
import { AuthorizationContext } from '../../context/AuthorizationContext'
export default function RestaurantsScreen({ navigation }) {
  const [restaurants, setRestaurants] = useState([])
  // Usaremos un useContext que guardará la info de quién está logueado en un lugar accesible para todas las pantallas
  // 1. Obtener el usuario logueado desde el contexto: trae del AuthorizationContext el usuario que está logueado
  // loggedInUser: objeto con los datos del usuario logueado
  // AuthorizationContext: guarda si hay un usuario logueado o no y, si lo hay, guarda sus datos
  // 2. Si nadie ha iniciado sesión: no hacemos petición
  // 2. Si hay alguien logueado: hacemos petición para pedir sus restaurantes

  const { loggedInUser } = useContext(AuthorizationContext)
  useEffect(() => {
    async function fetchRestaurants () { 
      try {
        const fetchedRestaurants = await getAll() // Llama a la función getAll() y guarda la respuesta en la variable fetchedRestaurants
        setRestaurants(fetchedRestaurants) // Actualiza el estado con los nuevos datos
      } catch (error) { // Error handling
        showMessage({
          message: `There was an error while retrieving restaurants. ${error} `,
          type: 'error',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })
      }
    }
    if (loggedInUser) { // Only fetched if a loggedInUser exists
      fetchRestaurants()
    } else {
      setRestaurants(null)
    }
  }, [loggedInUser]) // Ejecutar cuando cambia loggedInUser
  const renderRestaurant = ({ item }) => {
    return (
      <Pressable
        style={styles.row}
        onPress={() => {
          navigation.navigate('RestaurantDetailScreen', { id: item.id })
        }}>
        <TextRegular>
          {item.name}
        </TextRegular>
      </Pressable>
    )
  }

  const renderRestaurantWithImageCard = ({ item }) => { // desestructurar
    return (
      <ImageCard
        imageUri={item.logo ? { uri: API_BASE_URL + '/' + item.logo } : restaurantLogo}
        title={item.name}
        onPress={() => {
          navigation.navigate('RestaurantDetailScreen', { id: item.id })
        }}
      >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        {item.averageServiceMinutes !== null &&
          <TextSemiBold>Avg. service time: <TextSemiBold textStyle={{ color: GlobalStyles.brandPrimary }}>{item.averageServiceMinutes} min.</TextSemiBold></TextSemiBold>
        }
        <TextSemiBold>Shipping: <TextSemiBold textStyle={{ color: GlobalStyles.brandPrimary }}>{item.shippingCosts.toFixed(2)}€</TextSemiBold></TextSemiBold>
      </ImageCard>
    )
  }

  return (
    <FlatList
      style={styles.container}
      data={restaurants}
      renderItem={renderRestaurantWithImageCard}
      keyExtractor={item => item.id.toString()}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  actionButton: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    margin: '1%',
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'column',
    width: '50%'
  },
  text: {
    fontSize: 16,
    color: 'white',
    alignSelf: 'center',
    marginLeft: 5
  }
})
