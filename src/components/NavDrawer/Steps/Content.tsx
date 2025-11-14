import { List, ListItem, Typography } from "@mui/material";
import type {
  ContentBlock,
  ContentItem,
  VisualizationContentItem,
} from "../../../utils/drawerTypes";
import { Item } from "./Item";
import { Visualization } from "./Visualization";

const ListItemStyles: React.CSSProperties = {
  padding: 0,
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "flex-start",
};

// const BulletStyle: React.CSSProperties = {
//   fontWeight: 700,
//   paddingLeft: "4px",
//   paddingRight: "4px",
// };

const TitleStyles: React.CSSProperties = {
  fontWeight: 700,
};

type ContentBlockProps = {
  contentBlock: ContentBlock;
  visualization?: boolean;
};

export function ContentBlock({
  contentBlock: { title, variant, items = [] },
  visualization = false,
}: ContentBlockProps) {
  const variantType = visualization ? "visualization" : variant;
  switch (variantType) {
    case "list": {
      return (
        <>
          {title && <Typography sx={TitleStyles}>{title}</Typography>}
          <List>
            {items.map((item, index) => (
              <ListItem key={index} sx={ListItemStyles}>
                <Item {...(item as ContentItem)} />
              </ListItem>
            ))}
          </List>
        </>
      );
    }
    case "visualization": {
      return (
        <>
          {items.length > 0 && (
            <Visualization
              title={title ? title : ""}
              item={items[0] as VisualizationContentItem}
              handleClose={() => {}}
            />
          )}
        </>
      );
    }
    default: {
      return (
        <>
          {title && <Typography sx={TitleStyles}>{title}</Typography>}
          {items.length > 0 &&
            items.map((item, index) => (
              <Item key={index} {...(item as ContentItem)} />
            ))}
        </>
      );
    }
  }
}
