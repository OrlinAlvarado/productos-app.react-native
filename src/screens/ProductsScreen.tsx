import React, { useContext } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { StackScreenProps } from '@react-navigation/stack';

import { ProductsContext } from '../context/ProductsContext';
import { ProductsStackParams } from '../navigator/ProductsNavigator';
import { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props extends StackScreenProps<ProductsStackParams, 'ProductsScreen'>{}

export const ProductsScreen = ({ navigation }: Props) => {
    const { products, loadProducts, isLoading } = useContext(ProductsContext);
    const { top } = useSafeAreaInsets();
    
    
    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                    activeOpacity={ 0.8 }
                    style={{
                        marginRight: 10
                    }}
                    onPress={ () => navigation.navigate('ProductScreen', {})}
                >
                    <Text>Agregar</Text>
                </TouchableOpacity>
            )
        })
    }, [])
    
    
    return (
        <View style={{ flex: 1, marginHorizontal: 5 }}>
            
            <FlatList 
                data={ products }
                style={{ marginTop: isLoading ? top : 0 }}
               
                keyExtractor={(p) => p._id }
                ItemSeparatorComponent={ () => (
                    <View style={ styles.itemSeparator } />
                )}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        activeOpacity={ 0.8 }
                        onPress={ 
                            () => navigation.navigate('ProductScreen', {
                                id: item._id,
                                name: item.nombre
                            })
                        }
                    >
                        <Text style={ styles.productName }>{ item.nombre }</Text>
                    </TouchableOpacity>
                )}
                refreshControl={
                    <RefreshControl 
                    refreshing={ isLoading }
                    onRefresh={ loadProducts }
                    progressViewOffset={ 10 }
                    progressBackgroundColor="#5856D6"
                    colors={ ['white', 'red', 'orange']} //Solo en Android
                    style={{ backgroundColor: "#5856D6"}} //Solo en ios
                    tintColor="white" //Solo ios
                    title="Refresshing" //Solo ios
                    titleColor="white"  //Solo ios
                />
                }
            />
        </View>
    )
}

const styles = StyleSheet.create({
    productName: {
        fontSize: 20
    }, 
    itemSeparator: {
        borderBottomWidth: 2,
        marginVertical: 5,
        borderBottomColor: 'rgba(0,0,0,0.1)'
    }
});
