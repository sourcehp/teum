"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useId, useState } from "react";

type Item = { id: string };

function Row<T extends Item>({
  item,
  renderItem,
}: {
  item: T;
  renderItem: (item: T, handle: React.ReactNode) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });
  const handle = (
    <button
      type="button"
      ref={setActivatorNodeRef}
      aria-label="순서 바꾸기 (끌어서 옮기거나, 선택 후 스페이스와 방향키를 사용하세요)"
      title="끌어서 순서를 바꿉니다"
      className="flex h-10 w-8 shrink-0 cursor-grab touch-none items-center justify-center text-lg text-muted hover:text-ink active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      ⠿
    </button>
  );
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? "relative z-10 opacity-80 shadow-lg" : undefined}
    >
      {renderItem(item, handle)}
    </li>
  );
}

/** 끌어서(또는 키보드로) 순서를 바꾸는 목록. 바뀐 id 순서를 onReorder 로 알린다. */
export function SortableList<T extends Item>({
  items,
  renderItem,
  onReorder,
  className = "",
}: {
  items: T[];
  renderItem: (item: T, handle: React.ReactNode) => React.ReactNode;
  onReorder: (ids: string[]) => void | Promise<void>;
  className?: string;
}) {
  const [order, setOrder] = useState(items);
  const signature = items.map((i) => i.id).join(",");
  useEffect(() => setOrder(items), [signature, items]);
  const dndId = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = order.findIndex((i) => i.id === active.id);
    const to = order.findIndex((i) => i.id === over.id);
    if (from < 0 || to < 0) return;
    const next = arrayMove(order, from, to);
    setOrder(next);
    void onReorder(next.map((i) => i.id));
  }

  return (
    <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={order.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <ul className={className}>
          {order.map((item) => (
            <Row key={item.id} item={item} renderItem={renderItem} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
