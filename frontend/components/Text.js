import React from 'react';
import { Text as RNText } from 'react-native';
import { fonts, colors } from '../constants/theme';

const Text = ({ style, children, ...props }) => {
  // Log detalhado para depuração
  console.log('Renderizando Text:', {
    style: JSON.stringify(style),
    children: children?.toString(),
    props: Object.keys(props)
  });

  // Estilo padrão
  const defaultStyle = {
    fontFamily: fonts.regular || 'Roboto-Regular',
    color: colors.light || '#FFFFFF'
  };

  // Garantir que style seja sempre válido
  const textStyle = Array.isArray(style)
    ? [defaultStyle, ...style.filter(Boolean)]
    : [defaultStyle, style].filter(Boolean);

  return <RNText style={textStyle} {...props}>{children}</RNText>;
};

export default Text;