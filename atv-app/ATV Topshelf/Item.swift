//
//  Item.swift
//  ATV Topshelf
//
//  Created by Tim Broddin on 22/09/2019.
//  Copyright © 2019 Tim Broddin. All rights reserved.
//

import Foundation

/// A struct that represents the metadata for a single movie.
struct Item: Codable {
    

    /// The movie's unique identifier.
    var title: String

    var url: String
    var image: String
    var content: String
    var guid: String


    /// Create an image URL by adding `scale` to the receiver's `imageName`.
    func imageURL() -> URL? {

        return URL(string: self.image)
    }
    
    func itemURL() -> URL? {

        return URL(string: self.url)
    }


}
