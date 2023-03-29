import { ContactsList } from "../redux/contacts/slice";

export function checkNickname (username: string, contactList: ContactsList){
    for (let contact of contactList){
        if (contact.contactUsername === username){
            return contact.nickname || contact.contactUsername
        }
    }
}