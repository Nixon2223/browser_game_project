import React from 'react';
import "../css/GridItems.css"
import "../css/Sizing.css"
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd'

function GridItem({row, col, item}) {
  
  return (
  <Droppable droppableId={"grid" + "-" + `${row}` + "-" + `${col}`}>
  {(provided) => (
  <div className = "grid-item" style={{backgroundImage: `url(${item.image_url})`, backgroundSize: 'cover'}} {...provided.droppableProps} ref={provided.innerRef} index = {`${col + row}`}>
  {provided.placeholder}
  </div>
  )}
  </Droppable>
  )
}

export default GridItem