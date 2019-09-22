//
//  ContentProvider.swift
//  ATV Topshelf
//
//  Created by Tim Broddin on 22/09/2019.
//  Copyright © 2019 Tim Broddin. All rights reserved.
//

import TVServices

class ContentProvider: TVTopShelfContentProvider {

    override func loadTopShelfContent(completionHandler: @escaping (TVTopShelfContent?) -> Void) {
        // Fetch content and call completionHandler
        DispatchQueue.global().async {
        print("Loading topshelf, right?")
        guard let url = URL(string: "https://bt6mkne51j.execute-api.eu-west-1.amazonaws.com/dev/topshelf") else {return}
        let task = URLSession.shared.dataTask(with: url) { (data, response, error) in
        guard let dataResponse = data,
                  error == nil else {
                  print(error?.localizedDescription ?? "Response Error")
                  return }
            do{
                //here dataResponse received from a network request
                let decoder = JSONDecoder()
                decoder.keyDecodingStrategy = .convertFromSnakeCase
                decoder.dateDecodingStrategy = .secondsSince1970
                let response = try decoder.decode(ItemResponse.self, from: dataResponse)

                // Reply with a content object.
                let items = response.items.map { $0.makeCarouselItem() }
               
                let liveItem = TVTopShelfSectionedItem(identifier: "live")
                liveItem.title = "Kijk live"
                liveItem.setImageURL(URL(string: "https://pbs.twimg.com/media/DGKwL3yXcAAfMvh?format=jpg&name=4096x4096"), for: .screenScale1x)
                liveItem.imageShape = .hdtv
                liveItem.displayAction = URL(string: "atv://live").map { TVTopShelfAction(url: $0) }
                liveItem.playAction = URL(string: "atv://live").map { TVTopShelfAction(url: $0) }
                
                let liveSection =  TVTopShelfItemCollection(items: [liveItem])
                liveSection.title = "Live"
               
                let itemSection =  TVTopShelfItemCollection(items: items)
                itemSection.title = "Laatste items"
                let content = TVTopShelfSectionedContent(sections: [liveSection, itemSection])
                
                completionHandler(content)

                
             } catch let parsingError {
                print(dataResponse);
                print("Error", parsingError)
                completionHandler(nil)


           }
        }
        task.resume()
        }
    }

}

extension Item {

    /// Make a carousel item that represents the movie.
    fileprivate func makeCarouselItem() -> TVTopShelfSectionedItem {
        let item = TVTopShelfSectionedItem(identifier: guid)

 
        item.title = title
        //item.summary = content
       // item.previewVideoURL = previewVideoURL
        item.setImageURL(imageURL(), for: .screenScale1x)
        item.setImageURL(imageURL(), for: .screenScale2x)
        item.imageShape = .hdtv

        item.playAction = URL(string: "atv://play/\(url)").map { TVTopShelfAction(url: $0) }
        item.displayAction = URL(string: "atv://play/\(url)").map { TVTopShelfAction(url: $0) }

        return item
    }


}
