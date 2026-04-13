-- Stage 14f — Relationship Notification Trigger
-- Apply this via the Supabase SQL editor (Dashboard → SQL Editor).
--
-- When a row is inserted or deleted in content_collections, the trigger
-- computes cousin subcategory relationships and writes a notification
-- to menu_relationship_notifications.

CREATE OR REPLACE FUNCTION notify_cousin_relationship_change()
RETURNS TRIGGER AS $$
DECLARE
  v_content_id     uuid;
  v_collection_id  uuid;
  v_subcategory_id uuid;
  v_change_type    text;
  v_cousin         record;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_content_id    := NEW.content_id;
    v_collection_id := NEW.collection_id;
    v_change_type   := 'cousin_added';
  ELSIF TG_OP = 'DELETE' THEN
    v_content_id    := OLD.content_id;
    v_collection_id := OLD.collection_id;
    v_change_type   := 'cousin_removed';
  ELSE
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Get subcategory of the affected content item
  SELECT subcategory_id INTO v_subcategory_id
  FROM content
  WHERE id = v_content_id;

  -- Nothing to do if content has no subcategory
  IF v_subcategory_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Find other subcategories that have content in the same collection
  -- (these are now cousin subcategories to v_subcategory_id)
  FOR v_cousin IN
    SELECT DISTINCT c.subcategory_id AS cousin_sub_id
    FROM content_collections cc
    JOIN content c ON c.id = cc.content_id
    WHERE cc.collection_id = v_collection_id
      AND c.subcategory_id IS NOT NULL
      AND c.subcategory_id <> v_subcategory_id
  LOOP
    -- Insert notification (ignore duplicate on same pair + change_type if needed)
    INSERT INTO menu_relationship_notifications
      (entity_a_type, entity_a_id, entity_b_type, entity_b_id, change_type, reason)
    VALUES (
      'subcategory',
      v_subcategory_id,
      'subcategory',
      v_cousin.cousin_sub_id,
      v_change_type,
      format(
        'Content item (%s) was %s collection (%s), creating/removing a cousin link.',
        v_content_id,
        CASE WHEN TG_OP = 'INSERT' THEN 'added to' ELSE 'removed from' END,
        v_collection_id
      )
    );
  END LOOP;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate to ensure idempotency
DROP TRIGGER IF EXISTS content_collections_relationship_trigger ON content_collections;

CREATE TRIGGER content_collections_relationship_trigger
AFTER INSERT OR DELETE ON content_collections
FOR EACH ROW
EXECUTE FUNCTION notify_cousin_relationship_change();
