cmake_minimum_required(VERSION 3.13)

project(RNWorkletApp)

# Import RNWorkletsCore
add_library(RNWorkletsCore SHARED IMPORTED)
set_target_properties(RNWorkletsCore PROPERTIES
    IMPORTED_LOCATION
    ${CMAKE_SOURCE_DIR}/../node_modules/react-native-worklets-core/android/libs/${ANDROID_ABI}/libRNWorkletsCore.so
)
