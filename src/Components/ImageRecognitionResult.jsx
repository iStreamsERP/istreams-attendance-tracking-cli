import React from 'react';
import {
    View,
    Text,
    SectionList,
    ActivityIndicator,
    StyleSheet
} from 'react-native';
import EmployeeListCard from './EmployeeListCard';
import { useNavigation } from '@react-navigation/native';
import { GlobalStyles } from '../Styles/styles';

const ImageRecognitionResult = ({ recogloading, groupedData }) => {
    const navigation = useNavigation();

    const handleAddEmployee = () => {
        console.log('Adding employee...');
        
        navigation.navigate('UpdateNonMatchedEmpScreen');
    };

    return (
        <View style={styles.employeeListContainer}>
            {recogloading ? (
                <View style={styles.loaderContainer}>
                    <Text style={[GlobalStyles.subtitle_4, { color: '#4064b1' }]}>Analysing your Image. Please Wait...</Text>
                    <ActivityIndicator size="small" color="#4064b1" />
                </View>
            ) : (
                <SectionList
                    sections={groupedData}
                    keyExtractor={(item, index) => item.EMP_NO + index}
                    renderSectionHeader={({ section: { title } }) => (
                        <Text style={[GlobalStyles.subtitle_1, { marginVertical: 10 }]}>
                            {title}
                        </Text>
                    )}
                    renderItem={({ item, section }) => (
                        <EmployeeListCard
                            loading={false}
                            selectedEmp={[item]}
                            onPress={section.title === 'Non-Matched Employee' ? () => handleAddEmployee() : null}
                        />
                    )}
                />
            )}
        </View>
    );
};

export default ImageRecognitionResult;

const styles = StyleSheet.create({
    loaderContainer: {
        marginTop: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
});


// import React from 'react';
// import {
//     View,
//     Text,
//     SectionList,
//     ActivityIndicator,
//     StyleSheet,
//     FlatList,
//     Image
// } from 'react-native';
// import EmployeeListCard from './EmployeeListCard';
// import { useNavigation } from '@react-navigation/native';
// import { GlobalStyles } from '../Styles/styles';

// const ImageRecognitionResult = ({ recogloading, groupedData }) => {
//     const navigation = useNavigation();

//     const handleAddEmployee = () => {
//         navigation.navigate('UpdateNonMatchedEmpScreen');
//     };

//     const allImages = groupedData.flatMap(group =>
//         group.data
//             .filter(emp => emp.EMP_IMAGE)
//             .map(emp => emp.EMP_IMAGE)
//     );
//     return (
//         <View style={styles.employeeListContainer}>
//             {recogloading ? (
//                 <View style={styles.loaderContainer}>
//                     {/* <Text style={[GlobalStyles.subtitle_4, { color: '#4064b1' }]}>
//                         Analysing your Image. Please Wait...
//                     </Text>
//                     <ActivityIndicator size="small" color="#4064b1" /> */}
//                 </View>
//             ) : (
//                 <>
//                     {/* ⬇️ Show EMP_IMAGEs here */}
//                     {allImages.length > 0 && (
//                         <FlatList
//                             data={allImages}
//                             horizontal
//                             keyExtractor={(item, index) => index.toString()}
//                             renderItem={({ item }) => (
//                                 <Image
//                                     source={{ uri: item.startsWith('data:image') ? item : `data:image/jpeg;base64,${item}` }}
//                                     style={{ width: 80, height: 80, borderRadius: 40, marginRight: 10 }}
//                                 />
//                             )}
//                             contentContainerStyle={{ paddingVertical: 10, paddingHorizontal: 10 }}
//                             showsHorizontalScrollIndicator={false}
//                         />
//                     )}

//                     {/* Section List */}
//                     <SectionList
//                         sections={groupedData}
//                         keyExtractor={(item, index) => item.EMP_NO + index}
//                         renderSectionHeader={({ section: { title } }) => (
//                             <Text style={[GlobalStyles.subtitle_1, { marginVertical: 10 }]}>{title}</Text>
//                         )}
//                         renderItem={({ item, section }) => (
//                             <EmployeeListCard
//                                 loading={false}
//                                 selectedEmp={[item]}
//                                 onPress={section.title === 'Non-Matched Faces' ? () => handleAddEmployee() : null}
//                             />
//                         )}
//                     />
//                 </>
//             )}
//         </View>
//     );
// };

// export default ImageRecognitionResult;

// const styles = StyleSheet.create({
//     loaderContainer: {
//         marginTop: 10,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
// });