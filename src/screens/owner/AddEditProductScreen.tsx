import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constants/colors';
import Header from '../../components/Header';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useProducts, Product } from '../../context/ProductContext';
import { useProductMutations } from '../../api/queries';

interface AddEditProductScreenProps {
  navigation: any;
  route: any;
}

export const AddEditProductScreen: React.FC<AddEditProductScreenProps> = ({
  navigation,
  route,
}) => {
  const existingProduct: Product | undefined = route.params?.product;
  const isEditing = !!existingProduct;

  const { addProduct, updateProduct, categories } = useProducts();
  const { createProduct: createMutation, updateProduct: updateMutation } = useProductMutations();
  const validCategories = categories.filter((c) => c !== 'All');

  const [name, setName] = useState(existingProduct?.name || '');
  const [description, setDescription] = useState(existingProduct?.description || '');
  const [category, setCategory] = useState(existingProduct?.category || validCategories[0] || 'Clothes');
  const [price, setPrice] = useState(existingProduct ? String(existingProduct.price) : '');
  const [stock, setStock] = useState(existingProduct ? String(existingProduct.stock) : '');
  const [imageUrl, setImageUrl] = useState(
    existingProduct?.imageUrl ||
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80'
  );
  const [sku, setSku] = useState(existingProduct?.sku || '');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter a product name');
      return;
    }
    const numPrice = parseInt(price, 10);
    if (isNaN(numPrice) || numPrice <= 0) {
      setErrorMsg('Please enter a valid price in Rwandan Francs (RWF)');
      return;
    }
    const numStock = parseInt(stock, 10);
    if (isNaN(numStock) || numStock < 0) {
      setErrorMsg('Please enter a valid stock quantity');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Please provide a product description');
      return;
    }

    setLoading(true);

    try {
      if (isEditing && existingProduct) {
        const updates = {
          name: name.trim(),
          description: description.trim(),
          category,
          price: numPrice,
          stock: numStock,
          imageUrl,
          sku: sku.trim(),
        };
        try {
          await updateMutation.mutateAsync({ id: existingProduct.id, updates });
        } catch (e) {
          console.log('Server update fallback to local');
        }
        await updateProduct(existingProduct.id, updates);
      } else {
        const newProduct = {
          name: name.trim(),
          description: description.trim(),
          category,
          price: numPrice,
          stock: numStock,
          imageUrl,
          sku: sku.trim() || `DG-${category.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`,
          isFeatured: false,
          isNewArrival: true,
          isBestSeller: false,
        };
        try {
          await createMutation.mutateAsync(newProduct);
        } catch (e) {
          console.log('Server create fallback to local');
        }
        await addProduct(newProduct);
      }
    } finally {
      setLoading(false);
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <Header
          title={isEditing ? 'EDIT PRODUCT' : 'ADD NEW PRODUCT'}
          subtitle="D&G Inventory"
          showBack
          onBack={() => navigation.goBack()}
        />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Input
            label="Product Name"
            placeholder="e.g. Leather Oxford Shoes"
            value={name}
            onChangeText={setName}
          />

          {/* Category Picker */}
          <View style={styles.categoryPickerSection}>
            <Text style={styles.fieldLabel}>Department / Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
              {validCategories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.catPill,
                    category === cat && styles.catPillActive,
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.catPillText,
                      category === cat && styles.catPillTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <Input
            label="Price (RWF)"
            placeholder="e.g. 25000"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />

          <Input
            label="Initial Stock Quantity"
            placeholder="e.g. 15"
            value={stock}
            onChangeText={setStock}
            keyboardType="numeric"
          />

          <Input
            label="Product Image URL"
            placeholder="https://..."
            value={imageUrl}
            onChangeText={setImageUrl}
          />

          <Input
            label="SKU (Stock Keeping Unit - Optional)"
            placeholder="e.g. DG-CLO-009"
            value={sku}
            onChangeText={setSku}
          />

          <Input
            label="Description"
            placeholder="Detailed product information for customers..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            containerStyle={{ height: 110 }}
          />

          {errorMsg ? (
            <View style={styles.errorBanner}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="alert-circle" size={16} color={COLORS.blue} style={{ marginRight: 6 }} />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            </View>
          ) : null}

          <Button
            title={isEditing ? 'Save Changes' : 'Publish Product to Shop'}
            variant="primary"
            size="large"
            loading={loading}
            onPress={handleSubmit}
            style={styles.submitBtn}
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.blue,
    marginBottom: 8,
  },
  categoryPickerSection: {
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: 'row',
  },
  catPill: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  catPillActive: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 2,
  },
  catPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.blue,
  },
  catPillTextActive: {
    fontWeight: '900',
  },
  errorBanner: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 2,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.blue,
    fontWeight: '800',
    fontSize: 13,
  },
  submitBtn: {
    marginTop: 8,
  },
});

export default AddEditProductScreen;
