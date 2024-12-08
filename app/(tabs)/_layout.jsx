import FontAwesome from '@expo/vector-icons/FontAwesome';
import Entypo from '@expo/vector-icons/Entypo';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#125B9A', // Active tab color
        tabBarInactiveTintColor: '#888', // Inactive tab color
        tabBarShowLabel: false, // Hide labels
        tabBarStyle: {
          height: 60,
          justifyContent: 'center',
          alignItems: 'center',
          borderTopRightRadius: 20,
          borderTopLeftRadius: 20,
          backgroundColor: '#ffffff',
          paddingTop: 10,
          // Uncomment the following for shadow effect
          // shadowColor: '#000',
          // shadowOpacity: 0.1,
          // shadowOffset: { width: 0, height: -3 },
          // shadowRadius: 4,
          // elevation: 5,
        },
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Entypo size={28} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reel"
        options={{
          title: 'Reels',
          tabBarIcon: ({ color }) => (
            <FontAwesome
              size={30}
              name="play-circle"
              color={color}
              // Uncomment the following for focused effect
              // style={{
              //   marginBottom: focused ? 10 : 0, // Lift icon slightly when focused
              //   textShadowColor: focused ? '#125B9A' : '#ccc',
              //   textShadowRadius: focused ? 5 : 0, // Glow effect
              // }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="user" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
