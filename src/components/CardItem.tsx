import React from 'react'
import { Product } from '../types'
import { StarFilled } from '@ant-design/icons'
import './CardItem.scss'

interface ICardItemProps {
  item: Product
}

export default function CardItem({item}: ICardItemProps) {
  return (
    <div className="card-item-container">
      <div className="flex items-center justify-center w-[174px] h-[174px] max-w-[174px] max-h-[174px]">
        <img src={item.image} alt="product" width={174} height={174} className="mx-[auto] max-w-[174px] max-h-[174px] object-contain" />
      </div>
      <div>
        <div className="text-[12px] font-semibold mt-1 opacity-70 uppercase mt-3 mb-2">{item.categories[0]}</div>
        <div className="text-[.9rem] font-bold ">{ item.name }</div>
        <div className="text-[0.9rem] limit-line leading-tight">{ item.description }</div>
      </div>
      <div className="flex items-center gap-1 my-3.5">
        <span className="text-[#e2a400] text-xs font-bold">$</span>
        <span className="text-sm font-bold">{ item.price }</span>
        <div className="text-[#e2a400] text-xs font-semibold ml-1 p-0.5 border border-[rgba(226,164,0,.5)] rounded-sm w-fit">
          <StarFilled style={{color: '#e2a400'}} size={8}/>
          <div className="text-xs inline-block ml-1">{item.rating}</div>
        </div>
      </div>
    </div>
  )
}
