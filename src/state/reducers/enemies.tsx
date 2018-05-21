const defaultEnemies:any[] = [];
  
export function enemiesReducer(enemies:any=null, action:any) {
    if(enemies === null) {
        enemies = defaultEnemies;
    }
    switch (action.type) {
        case 'START' :
            break;
        default :
            break;    
    }
    return enemies;
}