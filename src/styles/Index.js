import {StyleSheet} from 'react-native';


export const themeColor = {
  blue: '#027EB7',
  purple: '#813488',
  pink:  '#E75A5A',
  darkBlue: '#003778',
}

export const textColor = {
  tertiary: '#ff8200',
  darkcyan: '#008b8b',
  white: '#ffffff',
  black: '#000000',
}

export const appBar = {
  titleColor: '#ffffff',
  backgroundColor: '#003778',
  backgroundColorPink: '#E75A5A'
};

const styles = StyleSheet.create({
  appBarContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: themeColor.darkBlue,
  },
  appBarTitle: {
    fontSize: 24,
    fontWeight: '400',
    letterSpacing: 0.4,
    color: appBar.titleColor,
  },
  appBarLeadingContainer:{
    marginRight: 16,
  },
  appBarTraling: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  headline5: {
    fontSize: 24,
    fontWeight: '400',
    letterSpacing: 0.75,
    color: '#000000',
  },
  headline6: {
    fontSize: 20,
    fontWeight: '400',
    letterSpacing: 0.4,
    color: '#000000',
  },
  title1: {
    fontSize: 18,
    fontWeight: '400',
    letterSpacing: 0.25,
    color: '#000000'
  },
  body1: {
    fontSize: 17,
    fontWeight: '400',
    letterSpacing: 0.15,
    color: '#332f2f',
  },
  body2: {
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.25,
    color: '#332f2f',
  },
  button: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 1.25,
  },
});

export default styles;
