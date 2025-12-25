import { db, storage } from '../firebase';
import { 
  collection, getDocs, addDoc, query, where, orderBy, limit as firestoreLimit, 
  doc, deleteDoc, updateDoc, setDoc, getDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { NailDesign, Category, AdsSettings, SiteSettings } from '../types';
import { DESIGNS as MOCK_DESIGNS, CATEGORIES as MOCK_CATEGORIES, ADS_SETTINGS as DEFAULT_ADS, SITE_SETTINGS as DEFAULT_SITE } from '../constants';

const DESIGNS_COLLECTION = 'designs';
const CATEGORIES_COLLECTION = 'categories';
const SETTINGS_COLLECTION = 'settings';

export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
};

export const uploadImage = async (file: File): Promise<string> => {
  try {
    const filename = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `images/${filename}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

// --- SETTINGS (ADS & SITE) ---

export const getAdsSettings = async (): Promise<AdsSettings> => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'ads');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { ...DEFAULT_ADS, ...docSnap.data() } as AdsSettings;
    }
    return DEFAULT_ADS;
  } catch (e) {
    console.error("Error fetching ads settings:", e);
    return DEFAULT_ADS;
  }
};

export const saveAdsSettings = async (settings: AdsSettings): Promise<void> => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'ads');
    await setDoc(docRef, settings);
  } catch (e) {
    console.error("Error saving ads settings:", e);
    throw e;
  }
};

export const getSiteSettings = async (): Promise<SiteSettings> => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'global');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { ...DEFAULT_SITE, ...docSnap.data() } as SiteSettings;
    }
    return DEFAULT_SITE;
  } catch (e) {
    return DEFAULT_SITE;
  }
};

export const saveSiteSettings = async (settings: SiteSettings): Promise<void> => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'global');
    await setDoc(docRef, settings);
  } catch (e) {
    throw e;
  }
};

// --- CATEGORIES ---

export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, CATEGORIES_COLLECTION));
    const categories: Category[] = [];
    querySnapshot.forEach((doc) => {
      categories.push({ ...doc.data(), id: doc.id } as Category & { id?: string });
    });
    
    // ✅ FIX: Agar database khali hai toh empty list return karo (Mock nahi)
    return categories;
  } catch (e) {
    console.error("Error fetching categories:", e);
    return []; 
  }
};

export const saveCategory = async (category: Category): Promise<void> => {
  try {
    const q = query(collection(db, CATEGORIES_COLLECTION), where("slug", "==", category.slug));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      await addDoc(collection(db, CATEGORIES_COLLECTION), category);
    } else {
       const docRef = querySnapshot.docs[0].ref;
       await updateDoc(docRef, category as any);
    }
  } catch (e) {
    throw e;
  }
};

export const deleteCategory = async (slug: string): Promise<void> => {
  try {
    const q = query(collection(db, CATEGORIES_COLLECTION), where("slug", "==", slug));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });
  } catch (e) {
    console.error("Error deleting category", e);
    throw e;
  }
};

export const getCategoryBySlug = async (slug: string): Promise<Category | undefined> => {
  const cats = await getAllCategories();
  return cats.find((c) => c.slug === slug);
};

// --- DESIGNS ---

export const saveDesign = async (design: NailDesign): Promise<void> => {
  try {
    await addDoc(collection(db, DESIGNS_COLLECTION), design);
  } catch (e) {
    throw e;
  }
};

export const updateDesign = async (id: string, updates: Partial<NailDesign>): Promise<void> => {
  try {
    const q = query(collection(db, DESIGNS_COLLECTION), where("id", "==", id));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docRef = doc(db, DESIGNS_COLLECTION, querySnapshot.docs[0].id);
      await updateDoc(docRef, updates);
    }
  } catch (e) {
    console.error("Error updating design:", e);
    throw e;
  }
};

export const deleteCustomDesign = async (id: string): Promise<void> => {
  try {
    const q = query(collection(db, DESIGNS_COLLECTION), where("id", "==", id));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (docRef) => {
      await deleteDoc(docRef.ref);
    });
  } catch (e) {
    throw e;
  }
};

export const getDesignBySlug = async (slug: string): Promise<NailDesign | undefined> => {
  try {
    const q = query(collection(db, DESIGNS_COLLECTION), where("slug", "==", slug));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as NailDesign;
    }
    // ✅ FIX: Mock Data return nahi karna hai
    return undefined;
  } catch (e) {
    console.error("Error fetching design by slug:", e);
    return undefined;
  }
};

export interface FilterOptions {
  category?: string;
  color?: string;
  length?: string;
  shape?: string;
  searchQuery?: string;
}

export const getDesigns = async (options: FilterOptions = {}, limitCount: number = 20): Promise<NailDesign[]> => {
  try {
    let designsRef = collection(db, DESIGNS_COLLECTION);
    let constraints: any[] = [];
    if (!options.category) {
      constraints.push(orderBy("publishedAt", "desc"));
    } else {
      constraints.push(where("category", "==", options.category));
    }
    if (limitCount) {
      constraints.push(firestoreLimit(limitCount));
    }
    const q = query(designsRef, ...constraints);
    const querySnapshot = await getDocs(q);
    let designs: NailDesign[] = [];
    querySnapshot.forEach((doc) => {
      designs.push(doc.data() as NailDesign);
    });

    // ✅ FIX: Agar designs nahi hain, toh khali array bhejo (MOCK_DESIGNS NAHI)
    if (designs.length === 0) {
        return [];
    }

    if (options.searchQuery) {
      const qText = options.searchQuery.toLowerCase();
      designs = designs.filter(d => d.title.toLowerCase().includes(qText) || d.category.includes(qText));
    }
    return designs;
  } catch (e) {
    console.error("Error fetching designs:", e);
    return [];
  }
};

export const getRelatedDesigns = async (currentSlug: string, categorySlug: string): Promise<NailDesign[]> => {
  const all = await getDesigns({ category: categorySlug }, 10);
  return all.filter(d => d.slug !== currentSlug).slice(0, 6);
};