import React from 'react';
import { View, Text, Flex } from '@ant-design/react-native';
import { TouchableOpacity } from 'react-native';
import globalStyles from '@styles/globalStyles';
import styles from './styles';

type ProgressCardProps = {
  title: string;
  onpressText: string;
  onPress?: () => void;
  progressPercent: number;
  total: number;
  found: number;
  subText: string;
  progressColor: string;
};

export const ProgressCard: React.FC<ProgressCardProps> = ({
  title,
  onpressText,
  onPress,
  progressPercent,
  total,
  found,
  subText,
  progressColor,
}) => (
  <View style={globalStyles.card}>
    <Flex justify="between" style={globalStyles.cardRow}>
      <View style={styles.cardTextContainer}>
        <Text
          style={[globalStyles.labelSm, styles.titleText]}
          numberOfLines={2}
        >
          {title}
        </Text>
      </View>

      {onPress ? (
        <TouchableOpacity onPress={onPress}>
          <Text style={[globalStyles.labelSm, styles.primaryText]}>
            {onpressText}
          </Text>
        </TouchableOpacity>
      ) : (
        <Text style={[globalStyles.labelSm, styles.secondaryText]}>
          {onpressText}
        </Text>
      )}
    </Flex>

    <Flex justify="between" style={[globalStyles.cardRow, styles.cardRowSpacing]}>
      <Flex>
        <Text style={globalStyles.labelSm}>
          <Text style={globalStyles.labelMd}>{found}</Text>/{total}
          {subText ? <Text style={styles.subText}> {subText}</Text> : null}
        </Text>
      </Flex>
      <Text style={[globalStyles.labelSm, { color: progressColor }]}>
        {progressPercent}% Completed
      </Text>
    </Flex>

    <View style={globalStyles.progressBarBg}>
      <View
        style={[
          globalStyles.progressBarFill,
          { backgroundColor: progressColor, width: `${progressPercent}%` },
        ]}
      />
    </View>
  </View>
);
