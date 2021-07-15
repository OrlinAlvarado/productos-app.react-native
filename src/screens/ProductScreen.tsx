import React, { useEffect, useState } from 'react'

import { StackScreenProps } from '@react-navigation/stack';
import { Button, Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Picker } from '@react-native-picker/picker';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

import { ProductsStackParams } from '../navigator/ProductsNavigator';
import { useCategories } from '../hooks/useCategories';
import { useForm } from '../hooks/useForm';
import { useContext } from 'react';
import { ProductsContext } from '../context/ProductsContext';

interface Props extends StackScreenProps<ProductsStackParams, 'ProductScreen'>{}
export const ProductScreen = ({ route, navigation }: Props) => {
    const { id = '', name = ''} = route.params;
    const [tempUri, setTempUri] = useState<string>('');
    const { categories } = useCategories();
    
    const { loadProductById, updateProduct, addProduct, deleteProduct, uploadImage } = useContext(ProductsContext);
    
    const {_id, categoriaId, nombre, img, form, onChange, setFormValue } = useForm({
        _id: id,
        categoriaId: '',
        nombre: name,
        img: ''
    });
    
    useEffect(() => {
        navigation.setOptions({
            title: nombre ? nombre : 'Sin nombre de producto'
        })
    }, [nombre])
    
    
    useEffect(() => {
        loadProduct();
    }, [])
    
    const loadProduct = async() => {
        if(id.length === 0) return; 
        
        const product = await loadProductById(id);
        setFormValue({
            _id: id,
            categoriaId: product.categoria._id,
            img: product.img || '',
            nombre
        })
    }
    
    const saveOrUpdate = async () => {
        if(id.length > 0){
            updateProduct(categoriaId, nombre, _id);
        } else {
            
            const tempCatetoryId = categoriaId || categories[0]._id;
            const newProduct = await addProduct(tempCatetoryId, nombre);
            
            onChange(newProduct._id, '_id');
        }
    }
    
    const deleteProductDB = async() => {
       await deleteProduct(_id);
       navigation.pop();
    }
    
    const takePhoto = () => {
        launchCamera({
            mediaType: 'photo',
            quality: 0.5
        }, (resp) => {
            if(resp.didCancel) return;
            
            if(resp.assets.length ===0 || !resp.assets[0].uri) return;
            
            setTempUri(resp.assets[0].uri);
            uploadImage(resp, _id);
            
        });
    }
    const takePhotoFromGallery = () => {
        launchImageLibrary({
            mediaType: 'photo',
            quality: 0.5
        }, (resp) => {
            if(resp.didCancel) return;
            
            if(resp.assets.length ===0 || !resp.assets[0].uri) return;
            
            setTempUri(resp.assets[0].uri);
            uploadImage(resp, _id);
            
        });
    }
    
    
    return (
        <View style={ styles.container }>
            <ScrollView>
                <Text style={ styles.label }>Nombre del producto: </Text>
                <TextInput 
                    placeholder="Producto"
                    style={ styles.textInput }
                    value={ nombre }
                    onChangeText={ (value) => onChange(value, 'nombre')}
                />
                
                <Text style={ styles.label }>Categoría: </Text>
                <Picker
                    selectedValue={ categoriaId }
                    onValueChange={(value) => onChange(value, 'categoriaId') }
                >
                    {
                        categories.map(c => (
                            <Picker.Item key={ c._id } label={ c.nombre } value={ c._id } />
                        ))
                    }
                </Picker>
                
                <Button 
                    title="Guardar"
                    onPress={ saveOrUpdate }
                    color="#5856D6"
                />
                {
                    ( _id.length > 0 ) && (
                        <Button 
                            title="Eliminar"
                            onPress={ deleteProductDB }
                            color="red"
                        />
                    )    
                }
                
                {
                    ( _id.length > 0 ) && (
                        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10 }}>
                            <Button 
                                title="Cámara"
                                onPress={ takePhoto }
                                color="#5856D6"
                            />
                            <View style={{ width: 10 }} />
                            <Button 
                                title="Galería"
                                onPress={ takePhotoFromGallery }
                                color="#5856D6"
                            />
                        </View>
                    )
                }
                
                {
                    (img.length > 0 && tempUri.length === 0) && (
                        <Image 
                            source={{
                                uri: img
                            }}
                            style={{
                                marginTop: 20,
                                width: '100%',
                                height: 300
                            }}
                        />
                    )
                }
                
                {/* TODO: Mostrar imagen temporal */}
                {
                    (tempUri.length > 0) && (
                        <Image 
                            source={{
                                uri: tempUri
                            }}
                            style={{
                                marginTop: 20,
                                width: '100%',
                                height: 300
                            }}
                        />
                    )
                }
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 10,
        marginHorizontal: 20
    },
    label: {
        fontSize: 18
    }, 
    textInput: {
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        borderColor: 'rgba(0,0,0,0.2)',
        marginTop: 5,
        marginBottom: 15
    }
});