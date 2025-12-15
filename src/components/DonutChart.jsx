import { memo, useMemo } from "react";
import Svg, { Path, Circle } from "react-native-svg";

const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

const describeArc = (x, y, radius, startAngle, endAngle) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
    "L",
    x,
    y,
    "Z",
  ].join(" ");
};

function DonutChart({
  data,
  size = 240,
  innerRadius = 90,
  innerColor = "#FFFFFF",
}) {
  const radius = size / 2;

  const segments = useMemo(() => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (!total) return [];

    let cumulativeAngle = 0;

    return data.map((item, index) => {
      const sweepAngle = (item.value / total) * 360;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + sweepAngle;
      cumulativeAngle = endAngle;

      return {
        path: describeArc(radius, radius, radius, startAngle, endAngle),
        color: item.color,
        key: `${item.label}-${index}`,
      };
    });
  }, [data, radius]);

  return (
    <Svg width={size} height={size}>
      {segments.map((segment) => (
        <Path key={segment.key} d={segment.path} fill={segment.color} />
      ))}
      <Circle cx={radius} cy={radius} r={innerRadius} fill={innerColor} />
    </Svg>
  );
}

export default memo(DonutChart);
