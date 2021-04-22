import React from 'react';
import {Button} from 'react-native';


export default function TestMove ({MoveToFront}:{MoveToFront:Function;}){

    return (
      <Button title="Move Piece 2 to Top" onPress={()=>MoveToFront()} />
    )

}
