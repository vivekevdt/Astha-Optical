import * as React from 'react';
import { Drawer } from 'react-native-paper';

const SideDrawer = ({ navigation }) => {
  const [active, setActive] = React.useState('');

  return (
    <Drawer.Section title="Menu">
      <Drawer.Item
        label="Customers"
        active={active === 'customers'}
        onPress={() => {
          setActive('customers');
          navigation.navigate('Customers');
        }}
      />
      <Drawer.Item
        label="Add Customer"
        active={active === 'addCustomer'}
        onPress={() => {
          setActive('addCustomer');
          navigation.navigate('AddCustomer');
        }}
      />
    </Drawer.Section>
  );
};

export default SideDrawer;
