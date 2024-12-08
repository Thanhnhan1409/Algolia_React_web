import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Divider, Pagination, Rate, Select, Slider, Switch, Input, Checkbox, Empty } from 'antd';
import { ReloadOutlined, CaretDownOutlined , CaretUpOutlined, SearchOutlined } from '@ant-design/icons';

import Header from '../components/layouts/Header';
import CardItem from '../components/CardItem';
import './HomePage.scss';
import { Product, Category, Filter, BrandOption, ResponseData, ActiveCatetories, ValueChange } from '../types';
import { initializeQueryFilter } from '../Utils/getFilterParams';

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(16);
  const [activeItem, setActiveItem] = useState<ActiveCatetories>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [secondProducts, setSecondProducts] = useState<Product[]>([]);
  const [queryFilter, setQueryFilter] = useState<Filter>(initializeQueryFilter());
  const [paginatedItems, setPaginatedItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isChangeValue, setIsChangeValue] = useState<ValueChange>();
  const [ratings, setRatings] = useState<ResponseData>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  });
  const [priceRange, setPriceRange] = useState<[number, number]>([Infinity, -Infinity]);
  const [brandOptions, setBrandOptions] = useState<BrandOption[]>([]);
  const [activeRating, setActiveRating] = useState<string>();
  const [showAll, setShowAll] = useState<boolean>(false);

  const toggleCategory = (data: ActiveCatetories) => {
    if (activeItem.parent !== data.parent) {
      setActiveItem(data);
      onFilterChange('category', data.parent);
    } else {
      if(data.children === '') {
        setActiveItem({})
        onFilterChange('category', '');
      }else if(activeItem.children === data.children) {
        setActiveItem({
          ...activeItem,
          children: ''
        })
      onFilterChange('category', data.parent);
      } else {
        setActiveItem(data)
      onFilterChange('category', data.children);
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setCurrentPage(1);
  };

  const handleClearFilter = () => {
    setActiveItem({});
    setQueryFilter({freeShipping: true});
    fetchAllData();
    setPriceRange([Infinity, -Infinity]);
  }

  const onFilterChange = (key: string, value: any) => {
    setQueryFilter({
      ...queryFilter, [key]: value
    });
    if(key === 'brand') {
      setIsChangeValue({
        rating: false,
        brand: true
      })
    } else if(key === 'rating') {
      setIsChangeValue({
        brand: false,
        rating: true
      })
    } else {
      setIsChangeValue({
        brand: false,
        rating: false
      })
    }
  }

  const toggleRating = (key: string) => {
    if (activeRating === key) {
      setActiveRating('');
      onFilterChange('rating', undefined);
    } else {
      setActiveRating(key);
      onFilterChange('rating', Number(key));
    }
  }

  const filterBrandOpstions = (value: string) => {
    const filteredOptions = brandOptions.filter((option) => option.label.toLowerCase().includes(value.toLowerCase()));
    setBrandOptions(filteredOptions);
  }

  const fetchAllData = async () => {
    try {
      const categoryRes = await axios.get('http://localhost:3000/categories');
      setCategories(categoryRes.data);
    } catch (error) {
      console.log(error);
    }
  }

  const getSubDataFromProduct = (data: Product[]) => {
    const brandCount: { [key: string]: number } = {};
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let tmpRatings: ResponseData = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    }

    data.forEach((product: Product) => {
      brandCount[product.brand] = (brandCount[product.brand] || 0) + 1;

      if (product.price < minPrice) minPrice = product.price;
      if (product.price > maxPrice) maxPrice = product.price;

      if (product.rating >= 1 && product.rating <= 5) {
        tmpRatings[product.rating] += 1;
      }
    });
    const brandsParse = Object.keys(brandCount).map((key) => ({
      label: key,
      value: key,
    }));
    setPriceRange([minPrice, maxPrice]);
    // setBrands(brandCount);
    if(!isChangeValue?.brand) {
      setBrandOptions(brandsParse);
    }
    if(!isChangeValue?.rating) {
      setRatings(tmpRatings);
    }
  }

  const paginateItems = (data: Product[]) => {
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedList = data.slice(startIndex, startIndex + pageSize);
    setPaginatedItems(paginatedList);
  }

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchFilterData = async () => {
    try {
      const params = new URLSearchParams();
      if (queryFilter.priceRange) {
        params.append("price_gte", queryFilter.priceRange[0].toString());
        if (queryFilter.priceRange.length === 2) {
          params.append("price_lte", queryFilter.priceRange[1].toString());
        }
      }
      if (queryFilter.rating) {
        params.append("rating", queryFilter.rating.toString());
      }
      if (queryFilter.sort) {
        params.append("_sort", queryFilter.sort === "asc" ? "price" : "-price");
      }
      if (queryFilter.freeShipping !== undefined) {
        params.append("free_shipping", queryFilter.freeShipping ? "true" : "false");
      }
      if (queryFilter.brand?.length) {
        queryFilter.brand.forEach((brand) => params.append("brand", brand));
      }
      if (queryFilter.category) {
        params.append("category", queryFilter.category);
      }

      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState(null, "", newUrl);
      const hasFilters =
        queryFilter.rating ||
        (queryFilter.priceRange?.length === 2) ||
        queryFilter.brand?.length ||
        queryFilter.sort ||
        queryFilter.freeShipping !== undefined;
  
      let filterProducts: Product[] = products;
      if (hasFilters) {
        const res = await axios.get(`http://localhost:3000/products?${params.toString()}`);
        filterProducts = res.data || products;
      }
      if (queryFilter.search) {
        filterProducts = filterProducts.filter((product) =>
          product.name.toLowerCase().includes(queryFilter?.search?.toLowerCase() ?? '')
        );
      }
      if (queryFilter.category) {
        filterProducts = filterProducts.filter((product) =>
          product.categories.includes(queryFilter?.category ?? '')
        );
      }
      if (queryFilter.brand?.length) {
        filterProducts = filterProducts.filter((product) =>
          queryFilter?.brand?.includes(product.brand)
        );
      }
      getSubDataFromProduct(filterProducts);
      setSecondProducts(filterProducts);
      paginateItems(filterProducts);
    } catch (error) {
      console.error("Error fetching filter data:", error);
    }
  };
  
  useEffect(() => {
    if(queryFilter)
    fetchFilterData();
  }, [queryFilter]);

  useEffect (() => {
    setPaginatedItems(products.slice((currentPage - 1) * pageSize, currentPage * pageSize));
  }, [currentPage, pageSize]);

  return (
    <div>
      <Header onSearchChange={onFilterChange} />
      <main className="flex max-w-[1300px] mx-[auto] py-8 px-4">
        <nav className="w-[260px] mr-[60px] flex flex-col">
          <div className="flex justify-between h-fit min-h-[80px] mb-2">
            <h1 className="font-semibold text-2xl text-center my-[auto]">Filters</h1>
            <div className="flex gap-2 items-center cursor-pointer" onClick={handleClearFilter}>
              <ReloadOutlined style={{fontSize: '10px'}}/>
              <p className="text-xs text-[rgba(33,36,61,.5)]">Refresh Filter</p>
            </div>
          </div>
          <Divider style={{margin: 0}} />
          <div className="py-8">
            <h2 className="filter-title">Category</h2>
            <ul className="mt-2">
              {
                categories.slice().map((category, index) => (
                  <li key={index} className="mb-3" >
                    <div
                      className={`flex items-center gap-2 cursor-pointer ${(activeItem.parent === category.name) && 'font-semibold'} `}
                      onClick={() => toggleCategory({
                        parent: category.name,
                        children: ''
                      })}
                    >
                      {activeItem.parent === category.name ? (
                        <CaretDownOutlined style={{ color: "grey", fontSize: "8px" }} />
                      ) : (
                        <CaretUpOutlined style={{ color: "grey", fontSize: "8px" }} />
                      )}
                      <div className="flex items-center gap-2">
                        <span>{category.name}</span>
                        <div className="text-xs font-semibold p-0.5 rounded bg-[rgba(65,66,71,.08)]">{category.total}</div>
                      </div>
                    </div>
                    {(activeItem.parent === category.name) && category.subcategories && (
                      <ul className="ml-6 mt-2">
                        {category.subcategories.map((child, childIndex) => (
                          <li key={childIndex} className="mb-3" onClick={() => toggleCategory({
                            parent: category.name,
                            children: child.name
                          })}>
                            <div className={`flex items-center gap-2 cursor-pointer ${activeItem.children === child.name && 'font-semibold'} `}>
                              {
                                activeItem.children === child.name ? (
                                <CaretDownOutlined style={{ color: "grey", fontSize: "8px" }} />
                                ) : (
                                  <CaretUpOutlined style={{ color: "grey", fontSize: "8px" }} />
                                )
                              }
                              <div className="flex items-center gap-2">
                                <span>{child.name}</span>
                                <div className="text-xs font-semibold p-0.5 rounded bg-[rgba(65,66,71,.08)]">{child.total}</div>
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
              onChange={(e) => filterBrandOpstions(e.target.value)}
              style={{ backgroundColor: '#F4F4F4', borderRadius: '4px', border: 'none' }}
            />
            <div className="mt-4">
              <Checkbox.Group
                options={showAll? brandOptions : brandOptions.slice(0, 15)} 
                value={queryFilter.brand}
                onChange={(value) => onFilterChange('brand', value)}
                className="flex flex-col gap-2"
              />
              {
                brandOptions?.length > 15 && (!showAll ? <div onClick={() => setShowAll(true)} className="text-sm text-[#e2a400] cursor-pointer mt-4 ml-6 w-fit">Load All</div>
                : <div onClick={() => setShowAll(false)} className="text-sm text-[#e2a400] cursor-pointer mt-4 ml-6 w-fit">Show less</div>)
              }
            </div>
          </div>
          <Divider style={{margin: 0}} />
          <div className="py-8">
            <h2 className="filter-title">Price</h2>
            <Slider
              range
              min={1}
              max={1555}
              styles={
                {
                  track: {
                    backgroundColor: '#e2a400'
                  }
                }
              }
              step={1}
              defaultValue={priceRange}
              onChangeComplete={(value) => onFilterChange('priceRange', value)}
            />
          </div>
          <Divider style={{margin: 0}} />
          <div className="py-8">
            <h2 className="filter-title">Free shipping</h2>
            <div className="flex gap-1">
              <span className="text-[.9rem] ">Display only items with free shipping</span>
              <div className="flex items-center gap-1">
                <span className={`${true && 'text-[#e2a400]'} text-[.8rem]`}>{true? 'Yes' : 'No'}</span>
                <Switch
                  value={queryFilter.freeShipping}
                  onChange={(value) => onFilterChange('freeShipping', value)}
                  defaultChecked size={'small'}
                  className="text-[#e2a400]"
                />
              </div>
            </div>
          </div>
          <Divider style={{margin: 0}} />
          <div className="py-8">
            <h2 className="filter-title">Ratings</h2>
            <div>
              {Object.entries(ratings).reverse().map(([key, value]) => (
                <div
                  className={`flex items-center gap-2 cursor-pointer ${activeRating !== key && 'opacity-60'}`} key={key}
                  onClick={() => toggleRating(key)}
                >
                  <Rate disabled defaultValue={Number(key)} />
                  <span className="ratings-count">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </nav>
        <div className="w-[946px]">
          <div className="mt-8 mb-1.5 text-end">
            <Select
              defaultValue=""
              // style={{ width: 150 }}
              onChange={(value) => onFilterChange('sort', value)}
              variant="borderless"
              options={[
                { value: '', label: 'Sort by featured' },
                { value: 'asc', label: 'Price Ascending' },
                { value: 'des', label: 'Price Descending' },
              ]}
            />
            <Select
              defaultValue={16}
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
              {!paginatedItems.length?
              <div className="mt-20">
                <Empty />
              </div>
              : (<div className="grid grid-cols-4 gap-12">
                  {paginatedItems.map((item, index) => (
                    <CardItem item={item} key={index} />
                  ))}
                </div>)
              }
              {
                secondProducts.length > pageSize && 
                <Pagination
                  align="center"
                  current={currentPage}
                  pageSize={pageSize}
                  total={secondProducts.length}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                />
              }
          </div>
        </div>
      </main>
    </div>
  );
}
