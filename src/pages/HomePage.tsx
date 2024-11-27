import React, { useState } from 'react';
import Header from '../components/layouts/Header';
import CardItem from '../components/CardItem';
import { Divider, Menu, Pagination, Select } from 'antd';
import { items } from '../data/cardData';
import { ReloadOutlined, CaretDownOutlined , CaretUpOutlined, SearchOutlined } from '@ant-design/icons';
import { categories } from '../data/categoriesData';
import './HomePage.scss';
import Input from 'antd/es/input/Input';

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(16);
  const [activeItem, setActiveItem] = useState<number>(-1);

  const toggleCategory = (key: number) => {
    setActiveItem((prev) => (prev === key ? -1 : key));
  };

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedItems = items.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setCurrentPage(1);
  };

  const handleClearFilter = () => {
    setActiveItem(-1);
  }

  return (
    <div>
      <Header />
      <main className="flex max-w-[1300px] mx-[auto] py-8 px-4">
        <nav className="w-[260px] mr-[60px] flex flex-col">
          <div className="flex justify-between h-fit min-h-[80px] mb-2">
            <h1 className="font-semibold text-2xl text-center my-[auto]">Filters</h1>
            <div className="flex gap-2 items-center">
              <ReloadOutlined style={{fontSize: '10px'}}/>
              <p className="text-xs text-[rgba(33,36,61,.5)] cursor-pointer" onClick={handleClearFilter}>Refresh Filter</p>
            </div>
          </div>
          <Divider style={{margin: 0}} />
          <div className="py-8">
            <h2 className="filter-title">Category</h2>
            <ul className="mt-2">
              {
                categories.map((category) => (
                  <li key={category.key} className="mb-3">
                    <div
                      className={`flex items-center gap-2 cursor-pointer ${activeItem === category.key && 'font-semibold'} `}
                      onClick={() => toggleCategory(category.key)}
                    >
                      {activeItem === category.key ? (
                        <CaretDownOutlined style={{ color: "grey", fontSize: "8px" }} />
                      ) : (
                        <CaretUpOutlined style={{ color: "grey", fontSize: "8px" }} />
                      )}
                      <div className="flex items-center gap-2">
                        <span>{category.title}</span>
                        <div className="text-xs font-semibold p-0.5 rounded bg-[rgba(65,66,71,.08)]">{category.value}</div>
                      </div>
                    </div>
                    {activeItem === category.key && category.children && (
                      <ul className="ml-6">
                        {category.children.map((child) => (
                          <li key={child.key} className="mb-3">
                            <div className={`flex items-center gap-2 cursor-pointer ${activeItem === child.key && 'font-semibold'} `}>
                              {
                                activeItem === child.key ? (
                                <CaretDownOutlined style={{ color: "grey", fontSize: "8px" }} />
                                ) : (
                                  <CaretUpOutlined style={{ color: "grey", fontSize: "8px" }} />
                                )
                              }
                              <div className="flex items-center gap-2">
                                <span>{category.title}</span>
                                <div className="text-xs font-semibold p-0.5 rounded bg-[rgba(65,66,71,.08)]">{child.value}</div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))
              }
            </ul>
          </div>
          <Divider style={{margin: 0}} />
          <div className="py-8">
            <h2 className="filter-title">Brands</h2>
            <Input
              placeholder="Search for brands..."
              prefix={<SearchOutlined style={{ color: 'rgba(0,0,0,.8)', fontSize: '12px', padding: '0 8px' }} />}
              size="large"
              style={{ backgroundColor: '#F4F4F4', borderRadius: '4px', border: 'none' }}
            />
            <div>
              
            </div>
          </div>
          <Divider style={{margin: 0}} />
          <div className="py-8">
            <h2 className="filter-title">Price</h2>

          </div>
          <Divider style={{margin: 0}} />
          <div className="py-8">
            <h2 className="filter-title">Free shipping</h2>
            <div>
              <span>Display only items with free shipping</span>
              <div>

              </div>
            </div>
          </div>
          <Divider style={{margin: 0}} />
          <div className="py-8">
            <h2 className="filter-title">Ratings</h2>

          </div>
        </nav>
        <div className="w-[946px]">
          <div className="mt-8 mb-1.5 text-end">
            <Select
              defaultValue="featured"
              // style={{ width: 150 }}
              onChange={() => console.log('Sort changed')}
              variant="borderless"
              options={[
                { value: 'featured', label: 'Sort by featured' },
                { value: 'asc', label: 'Price Ascending' },
                { value: 'des', label: 'Price Descending' },
              ]}
            />
            <Select
              defaultValue={16}
              // style={{ width: 150 }}
              onChange={handlePageSizeChange}
              variant="borderless"
              options={[
                { value: 16, label: '16 hits per page' },
                { value: 32, label: '32 hits per page' },
                { value: 64, label: '64 hits per page' },
              ]}
            />
          </div>
          <Divider />
          <div>
            <div className="grid grid-cols-4 gap-12">
              {paginatedItems.map((item, index) => (
                <CardItem item={item} key={index} />
              ))}
            </div>
            <Pagination
              align="center"
              current={currentPage}
              pageSize={pageSize}
              total={items.length}
              onChange={handlePageChange}
              showSizeChanger={false}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
