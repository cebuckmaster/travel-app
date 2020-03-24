import { addTripModal } from './js/travel'
import { Trip } from './js/trip'
import { removeCurrentTrip} from './js/load-save-removeAPI'
import { saveCurrentTrip} from './js/load-save-removeAPI'
import { loadSavedTrips} from './js/load-save-removeAPI'
import { postData} from './js/postAPI'
import StartingImage from './media/take-off-pic.jpg'
import './styles/main.scss'
import './styles/modal.scss'
import 'js-datepicker/src/datepicker'


export {
    Trip,
    addTripModal,
    removeCurrentTrip,
    saveCurrentTrip,
    loadSavedTrips,
    postData
}